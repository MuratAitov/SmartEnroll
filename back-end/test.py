from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Инициализация клиента Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_remaining_core_courses(program_name, taken_classes, full_view=False, debug=False):
    """
    Универсальная функция для расчёта оставшихся кредитов в требованиях программы,
    где есть и 'Core'-группы, и обычные группы.

    'Core'-группы определяются по наличию слова "core" в названии группы (регистр не важен).
    Для таких групп учитываются атрибуты "Core: ...", прописанные в колонке attribute таблицы sections.

    Обычные группы (не содержащие "core" в названии) рассчитываются классическим способом:
    - Берутся курсы из таблицы requirement_courses
    - Смотрим, какие из них студент прошёл
    - Суммируем кредиты

    Параметры:
      :param program_name: Название программы (например, "University Core Requirements")
      :param taken_classes: Список словарей вида:
          [
            {
              "course_id": "POLS 103",
              "term": "Spring 2024",
              "section": "01"
            },
            ...
          ]
      :param full_view: Если True, выводим подробную информацию в консоль
      :param debug: Если True, выводим отладочные сообщения
    :return: Словарь вида:
        {
          "Название группы": {
             "json_id": ...,
             "required_credits": ...,
             "taken_credits": ...,
             "remaining_credits": ...,
             "taken_courses_in_group": [...],
             "available_courses": ...,
             "expected_attribute": ... или None
          },
          ...
        }
    """

    # 1) Получаем program_id
    resp = supabase.table("programs").select("program_id").eq("degree_program", program_name).execute()
    if not resp.data:
        return {"error": "Program not found"}
    program_id = resp.data[0]["program_id"]

    # 2) Получаем все группы требований для программы
    resp = supabase.table("requirement_groups").select("*").eq("program_id", program_id).execute()
    groups = resp.data or []

    # Сортируем группы по json_group_id (если есть)
    for g in groups:
        g["json_id"] = g.get("json_group_id", 0)
    groups.sort(key=lambda x: int(x["json_id"] or 0))

    # 3) Собираем информацию по взятым классам: атрибуты + кредиты
    #    Ключ: (course_id, term, section). Значение: {"core_attrs": [...], "credits": int}
    taken_info = {}

    # Сначала вытащим все (course_id, term, section) => attribute
    for tc in taken_classes:
        c_id = tc["course_id"]
        c_term = tc["term"]
        c_section = tc["section"]

        # Запрос к таблице sections, чтобы получить attribute
        resp_sec = supabase.table("sections").select("attribute") \
            .eq("course_id", c_id).eq("term", c_term).eq("section", c_section).execute()

        core_attrs = []
        if resp_sec.data:
            attr_str = resp_sec.data[0].get("attribute", "") or ""
            # Разбиваем по запятым, ищем подстроки, начинающиеся с "Core:"
            for part in attr_str.split(","):
                part = part.strip()
                if part.lower().startswith("core:"):
                    extracted = part[5:].strip()
                    core_attrs.append(extracted)

        # Определим кредиты курса (course_id в таблице courses хранится в поле code)
        # Можем сразу вытащить credits для всех уникальных course_id
        # но для наглядности сделаем в цикле
        resp_cr = supabase.table("courses").select("code, credits") \
            .eq("code", c_id).execute()
        c_credits = 0
        if resp_cr.data:
            c_credits = resp_cr.data[0].get("credits", 0)

        taken_info[(c_id, c_term, c_section)] = {
            "core_attrs": core_attrs,
            "credits": c_credits
        }

    # 4) Обработка групп
    remaining_requirements = {}

    for group in groups:
        group_name = group["name"]
        group_json_id = int(group["json_id"])
        required_credits = group["req_credits"]
        group_id = group["id"]

        # Проверяем, содержит ли название группы слово "core"
        # Если да, это "Core"-логика (атрибуты). Иначе — обычная логика (список курсов).
        is_core_group = ("core" in group_name.lower())

        allocated_courses = []  # какие course_id студент «закрыл» для этой группы
        total_taken_credits = 0

        if is_core_group:
            # ---- ЛОГИКА ДЛЯ CORE-ГРУПП ----
            # Допустим, если группа называется "Core Writing",
            # то ожидаемый атрибут = "Writing" (убираем "Core ")
            # Но если группа называется "Fundamental Core" (слово core в конце),
            # то вам нужно решить, как извлекать атрибут.
            # Ниже — простой вариант: используем всё название без слова "Core" как атрибут
            # или оставляем None, если не получается извлечь. Зависит от вашей БД.

            # Для демонстрации сделаем так:
            # - Если в начале есть "Core ", вырезаем его и берём остаток.
            # - Иначе (например "Fundamental Core") — будем считать, что
            #   атрибут называется "Fundamental" (убираем слово Core в конце).

            lower_name = group_name.lower()
            expected_attribute = None

            if lower_name.startswith("core "):
                # "Core Writing" -> "Writing"
                expected_attribute = group_name[5:].strip()
            elif lower_name.endswith(" core"):
                # "Fundamental Core" -> "Fundamental"
                expected_attribute = group_name[:-4].strip()
            else:
                # На ваше усмотрение. Можно взять всё название (без учёта регистра)
                # или вообще None. Зависит от реальных названий групп.
                # Для примера возьмём всё название, убирая "Core" внутри:
                # "Global Core Studies" -> "Global Studies"
                # Здесь просто демонстрирую возможный подход:
                parts = group_name.split()
                # убираем все куски 'core'/'Core'
                filtered_parts = [p for p in parts if p.lower() != "core"]
                expected_attribute = " ".join(filtered_parts).strip()

            # Ищем все классы, у которых есть нужный атрибут
            for (c_id, c_term, c_section), info in taken_info.items():
                if expected_attribute and (expected_attribute in info["core_attrs"]):
                    allocated_courses.append(c_id)
                    total_taken_credits += info["credits"]

            available_courses_str = f"CORE {required_credits}"  # условное поле, как в примере
        else:
            # ---- ЛОГИКА ДЛЯ Обычных ГРУПП ----
            expected_attribute = None  # тут не используется

            # Получаем список потенциальных курсов из requirement_courses
            resp_req = supabase.table("requirement_courses") \
                .select("course_code").eq("group_id", group_id).execute()
            potential_codes = set()
            if resp_req.data:
                for row in resp_req.data:
                    potential_codes.add(row["course_code"])

            # Проверяем, какие из этих potential_codes студент прошёл
            for (c_id, c_term, c_section), info in taken_info.items():
                if c_id in potential_codes:
                    allocated_courses.append(c_id)
                    total_taken_credits += info["credits"]

            # Для вывода (как в примере) можно показать "CORE <req_credits>",
            # но если это не core-группа, лучше показать что-то вроде:
            available_courses_str = f"{len(potential_codes)} potential courses"
            # Или любой другой текст, по вашему желанию.

        remaining_credits = max(0, required_credits - total_taken_credits)

        # Заполняем структуру
        remaining_requirements[group_name] = {
            "json_id": group_json_id,
            "required_credits": required_credits,
            "taken_credits": total_taken_credits,
            "remaining_credits": remaining_credits,
            "taken_courses_in_group": sorted(allocated_courses),
            "available_courses": available_courses_str,
            "expected_attribute": expected_attribute
        }

        if debug:
            print(f"[DEBUG] Group: {group_name} (json_id={group_json_id})")
            print(f"  is_core_group: {is_core_group}")
            print(f"  expected_attribute: {expected_attribute}")
            print(f"  allocated_courses: {allocated_courses}")
            print(f"  total_taken_credits: {total_taken_credits}")
            print(f"  remaining_credits: {remaining_credits}")
            print("-" * 60)

    # 5) Если нужно, печатаем «итоговый» вывод
    if full_view:
        print("\nFINAL OUTPUT:")
        for group_name, info in remaining_requirements.items():
            print(f"Group: {group_name}")
            print(f"  JSON Group ID: {info['json_id']}")
            print(f"  Required Credits: {info['required_credits']}")
            print(f"  Taken Credits: {info['taken_credits']}")
            print(f"  Remaining Credits: {info['remaining_credits']}")
            print(f"  Courses Taken in Group: {', '.join(info['taken_courses_in_group'])}")
            print(f"  Available Courses: {info['available_courses']}")
            if info['expected_attribute']:
                print(f"  (Core Attribute Used: {info['expected_attribute']})")
            print("=" * 60)

    return remaining_requirements


# ------------------- ПРИМЕР ИСПОЛЬЗОВАНИЯ -------------------

# Допустим, студент прошёл следующие классы:
taken_classes = [
    {"course_id": "POLS 103", "term": "Spring 2024", "section": "01"},
    {"course_id": "PHYS 104", "term": "Spring 2024", "section": "01"},
    {"course_id": "RELI 253", "term": "Spring 2025", "section": "04"},
    {"course_id": "RELI 377", "term": "Spring 2024", "section": "01"},
    {"course_id": "RELI 253", "term": "Spring 2025", "section": "04"},
    {"course_id": "VART 230", "term": "Fall 2023", "section": "01"},
    {"course_id": "ENGL 193", "term": "Spring 2023", "section": "10"},
    {"course_id": "RELI 228", "term": "Spring 2023", "section": "01"},
]

program_name = "University Core Requirements"

get_remaining_core_courses(
    program_name,
    taken_classes,
    full_view=True,
    debug=True
)


