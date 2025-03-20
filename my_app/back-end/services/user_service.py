import bcrypt
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_user(user_name: str, email: str, password: str, name: str) -> dict:
    """
    Creates a new user in the 'users' table with a unique user_name, a hashed password, and a display name.
    Automatically assigns user_id (auto-increment).
    Returns the inserted user data or an error if user_name is already taken.
    """

    # 1. Check if user_name already exists
    check_response = supabase.from_('users').select('*').eq('user_name', user_name).execute()
    if check_response.data:
        return {"error": f"user_name '{user_name}' is already in use."}

    # 2. Hash the password using bcrypt
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    # 3. Insert new user (user_id is auto-incremented by the DB)
    insert_data = {
        "user_name": user_name,
        "email": email,
        "password": hashed_password,
        "name": name
    }
    response = supabase.from_('users').insert(insert_data).execute()

    if not response.data or "error" in response.data:
        return {"error": response.data.get("error", "Unknown insert error")}


    # 4. Return the inserted record
    return {"data": response.data}

def check_login(user_name: str, password: str) -> dict:
    """
    Checks user's login credentials by comparing the provided password
    with the hashed password in the 'users' table (matched by user_name).
    Returns user data if successful, or an error otherwise.
    """
    try:
        # Find user by user_name
        response = supabase.from_('users').select('*').eq('user_name', user_name).single().execute()

        # Check if we got any data back
        if not response.data:
            return {"error": "User not found"}

        user_record = response.data
        stored_hashed_password = user_record['password']

        # Compare the provided password with the stored hash
        if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password.encode('utf-8')):
            # Remove password from user data before sending
            user_data = dict(user_record)
            user_data.pop('password', None)
            return {"data": user_data}  # Successful login
        else:
            return {"error": "Invalid credentials"}

    except Exception as e:
        print(f"Login error: {str(e)}")  # For debugging
        return {"error": "An error occurred during login"}

#result = create_user("Aa", "aa@gmail.com", "Aa", "Aa")
#print (result)
##add class (course_id, term = default , section (table = sections - column -> section) , )
def add_class_enrollment(
    user_id: int,
    in_process: bool,
    section_id: int = None,
    crn: str = None,
    course_id: str = None,
    term: str = None,
    section: str = None
) -> dict:
    """
    Универсальная функция добавления класса (секции) для пользователя.
    Может работать в нескольких режимах:
      1) Если передан section_id — ищет секцию по section_id.
      2) Если передан crn — ищет секцию по crn.
      3) Если переданы course_id, term, section:
         - Пытается найти точное совпадение
         - Если не находит, ищет другую секцию в том же term
         - Если не находит, ищет любую секцию по course_id (любой term)

    :param user_id:    ID пользователя
    :param in_process: Флаг, указывающий, находится ли курс в процессе (True/False)
    :param section_id: (опционально) ID секции
    :param crn:        (опционально) CRN секции
    :param course_id:  (опционально) ID курса
    :param term:       (опционально) Семестр/термин (например, "2023FA")
    :param section:    (опционально) Обозначение секции (например, "A", "B", "01")
    :return:           Словарь с результатом операции {"success": "..."} или {"error": "..."}
    """

    # 1) Проверяем, что пользователь существует
    user_check = supabase.table("users").select("user_id").eq("user_id", user_id).execute()
    if not user_check.data:
        return {"error": f"Пользователь с ID {user_id} не найден."}

    found_section_id = None
    found_course_id = None
    fallback_info = ""  # Сюда будем записывать информацию о том, как мы нашли секцию

    # 2) Определяем способ поиска секции
    if section_id is not None:
        # Поиск по section_id
        section_query = (
            supabase.table("sections")
            .select("section_id, course_id")
            .eq("section_id", section_id)
            .execute()
        )
        if not section_query.data:
            return {"error": f"Секция с section_id={section_id} не найдена."}

        found_section_id = section_query.data[0]["section_id"]
        found_course_id = section_query.data[0]["course_id"]

    elif crn is not None:
        # Поиск по CRN
        section_query = (
            supabase.table("sections")
            .select("section_id, course_id")
            .eq("crn", crn)
            .execute()
        )
        if not section_query.data:
            return {"error": f"Секция с CRN={crn} не найдена."}

        found_section_id = section_query.data[0]["section_id"]
        found_course_id = section_query.data[0]["course_id"]

    elif course_id and term and section:
        # Поиск по (course_id, term, section) с fallback
        exact_match = (
            supabase.table("sections")
            .select("section_id, course_id")
            .eq("course_id", course_id)
            .eq("term", term)
            .eq("section", section)
            .execute()
        )
        if exact_match.data:
            # Нашли точное совпадение
            found_section_id = exact_match.data[0]["section_id"]
            found_course_id = exact_match.data[0]["course_id"]
        else:
            # 2.1) Ищем любую другую секцию в том же term
            same_term_match = (
                supabase.table("sections")
                .select("section_id, course_id")
                .eq("course_id", course_id)
                .eq("term", term)
                .execute()
            )
            if same_term_match.data:
                found_section_id = same_term_match.data[0]["section_id"]
                found_course_id = same_term_match.data[0]["course_id"]
                fallback_info = (
                    f"Вместо секции '{section}' в семестре '{term}' выбрана секция "
                    f"{found_section_id} (в том же семестре)."
                )
            else:
                # 2.2) Ищем любую секцию по course_id (любой term)
                any_term_match = (
                    supabase.table("sections")
                    .select("section_id, course_id, term, section")
                    .eq("course_id", course_id)
                    .execute()
                )
                if any_term_match.data:
                    found_section_id = any_term_match.data[0]["section_id"]
                    found_course_id = any_term_match.data[0]["course_id"]
                    alt_term = any_term_match.data[0]["term"]
                    alt_section = any_term_match.data[0]["section"]
                    fallback_info = (
                        f"Вместо семестра '{term}' и секции '{section}' выбрана секция "
                        f"{found_section_id} (term='{alt_term}', section='{alt_section}')."
                    )
                else:
                    return {
                        "error": (
                            f"Секция (course_id={course_id}, term={term}, section={section}) не найдена. "
                            f"Нет альтернативных секций ни в этом семестре, ни в других."
                        )
                    }
    else:
        return {
            "error": (
                "Не указан корректный способ поиска секции. "
                "Передайте один из вариантов:\n"
                "  - section_id\n"
                "  - crn\n"
                "  - (course_id, term, section) (с fallback-поиском)"
            )
        }

    # 3) Проверяем, не записан ли пользователь уже на этот курс (в любой секции)
    enrollment_check = (
        supabase.table("enrollments")
        .select("section_id")
        .eq("user_id", user_id)
        .execute()
    )

    if enrollment_check.data:
        # Собираем все секции, на которые пользователь записан
        enrolled_section_ids = {record["section_id"] for record in enrollment_check.data}

        # Проверяем, нет ли среди этих секций тех, что принадлежат тому же курсу
        existing_course_check = (
            supabase.table("sections")
            .select("section_id")
            .eq("course_id", found_course_id)
            .in_("section_id", list(enrolled_section_ids))
            .execute()
        )

        if existing_course_check.data:
            return {
                "error": (
                    f"Пользователь {user_id} уже записан на курс {found_course_id} "
                    f"в секции {existing_course_check.data[0]['section_id']}."
                )
            }

    # 4) Добавляем запись в 'enrollments', включая поле in_process
    insert_data = {
        "user_id": user_id,
        "section_id": found_section_id,
        "in_process": in_process
    }
    response = supabase.table("enrollments").insert(insert_data).execute()

    # 5) Проверяем, успешно ли записали
    if not response.data:
        return {
            "error": "Не удалось добавить запись в enrollments. "
                     "Ответ Supabase: " + str(response)
        }

    # 6) Формируем итоговое сообщение
    success_message = (
        f"Пользователь {user_id} успешно записан в секцию {found_section_id} "
        f"курса {found_course_id}. in_process={in_process}"
    )
    if fallback_info:
        success_message += " " + fallback_info

    return {"success": success_message}

result = add_class_enrollment(
    user_id=1,
    in_process=False,
    course_id="CPSC 121",
    term="Spring 2024",
    section="01"
)
print(result)


# result = add_class_enrollment(
#     user_id=1,
#     in_process=True,
#     section_id=74611  # Секция с ID=123
# )
# print(result)

# crn_list = [
#     10076, 10077, 10078, 10843, 11854, 14324, 16479, 16481, 16541,
#     17231, 17285, 17530, 17923, 18196, 18204, 19127, 20001, 20014,
#     20051, 21499, 24331, 24333, 26766, 26858, 27432
# ]

# for crn in crn_list:
#     result = add_class_enrollment(
#         user_id=1,
#         in_process=True,
#         crn=str(crn)
#     )
#     print(result)
