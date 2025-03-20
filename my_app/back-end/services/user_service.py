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
def add_class_by_crn(user_id: int, crn: str, in_process: bool) -> dict:
    """
    Добавляет класс (секцию) для пользователя по CRN,
    проверяя, что пользователь не записан на тот же курс в другой секции.
    Также записывает флаг in_process в таблицу enrollments.

    :param user_id: ID пользователя
    :param crn: CRN секции (строка или число, в зависимости от структуры вашей БД)
    :param in_process: Флаг, указывающий, находится ли курс в процессе (True/False)
    :return: Словарь с результатом операции {"success": "..."} или {"error": "..."}
    """

    # 1) Проверяем, что пользователь существует
    user_check = supabase.table("users").select("user_id").eq("user_id", user_id).execute()
    if not user_check.data:
        return {"error": f"Пользователь с ID {user_id} не найден."}

    # 2) Ищем секцию по CRN
    section_check = (
        supabase.table("sections")
        .select("section_id, course_id")
        .eq("crn", crn)
        .execute()
    )
    if not section_check.data:
        return {"error": f"Секция с CRN {crn} не найдена."}

    # Извлекаем нужные данные
    section_id = section_check.data[0]["section_id"]
    course_id = section_check.data[0]["course_id"]

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

        # Проверяем, нет ли среди этих секций таких, что принадлежат тому же курсу
        existing_course_check = (
            supabase.table("sections")
            .select("section_id")
            .eq("course_id", course_id)
            .in_("section_id", list(enrolled_section_ids))
            .execute()
        )

        if existing_course_check.data:
            return {
                "error": (
                    f"Пользователь {user_id} уже записан на курс {course_id} "
                    f"в секции {existing_course_check.data[0]['section_id']}."
                )
            }

    # 4) Добавляем запись в 'enrollments', включая поле in_process
    insert_data = {
        "user_id": user_id,
        "section_id": section_id,
        "in_process": in_process
    }
    response = supabase.table("enrollments").insert(insert_data).execute()

    # 5) Проверяем, успешно ли записали
    if not response.data:
        return {"error": "Не удалось добавить запись в enrollments. Ответ Supabase: " + str(response)}

    return {"success": f"Пользователь {user_id} успешно записан в секцию {section_id} (CRN {crn}) курса {course_id}. in_process={in_process}"}

# Пример использования
result = add_class_by_crn(user_id=1, crn="11288", in_process=True)
print(result)