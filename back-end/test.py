from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Инициализация клиента Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_remaining_core_courses(program_name, taken_classes, full_view=False, debug=False):
    """
    Функция возвращает информацию по CORE‑требованиям программы.

    Для каждого требования (группы) она:
      - Получает требуемое количество кредитов (req_credits);
      - Определяет ожидаемый core‑атрибут (если имя группы начинается с "Core ", то удаляет этот префикс);
      - Для каждого пройденного класса (передаётся как словарь с course_id, term, section)
          запрашивает из таблицы sections значение колонки attribute,
          парсит строку и извлекает те элементы, которые начинаются с "Core:" (удалив префикс);
      - Если ожидаемый атрибут найден в списке атрибутов класса, то курс считается зачтённым для данной группы;
      - Суммируются кредиты (получаем их из таблицы courses) по подходящим курсам и вычисляются оставшиеся кредиты.

    :param program_name: Название программы (например, 'University Core Classes')
    :param taken_classes: Список словарей с ключами course_id, term, section
    :param full_view: Если True – вывод подробной информации по группам
    :param debug: Если True – печать отладочных сообщений
    :return: Словарь с информацией по группам CORE‑требований
    """
    # Получаем program_id
    resp = supabase.table("programs").select("program_id").eq("degree_program", program_name).execute()
    if not resp.data:
        return {"error": "Program not found"}
    program_id = resp.data[0]["program_id"]

    # Получаем все группы требований для программы (предполагаем, что для CORE используется та же таблица)
    resp = supabase.table("requirement_groups").select("*").eq("program_id", program_id).execute()
    groups = resp.data

    # Добавляем для каждой группы поле json_id (если есть) и сортируем по нему
    for group in groups:
        group['json_id'] = group.get('json_group_id')
    groups.sort(key=lambda g: int(g.get("json_id") or 0))

    # Для каждого пройденного класса получим core-атрибуты из таблицы sections
    # Формируем словарь: ключ – (course_id, term, section), значение – список извлечённых core-атрибутов
    taken_class_attributes = {}
    for tc in taken_classes:
        course_id = tc["course_id"]
        term = tc["term"]
        section = tc["section"]
        resp = supabase.table("sections").select("attribute") \
            .eq("course_id", course_id).eq("term", term).eq("section", section).execute()
        attributes_list = []
        if resp.data:
            attr_str = resp.data[0].get("attribute", "")
            # Разбиваем строку по запятым и ищем те части, что начинаются с "Core:"
            for part in attr_str.split(","):
                part = part.strip()
                if part.lower().startswith("core:"):
                    # Извлекаем всё, что после "Core:"
                    extracted = part[5:].strip()
                    attributes_list.append(extracted)
        taken_class_attributes[(course_id, term, section)] = attributes_list

    # Подготовка для суммирования кредитов по пройденным классам
    unique_course_ids = list({tc["course_id"] for tc in taken_classes})
    resp = supabase.table("courses").select("code, credits").in_("code", unique_course_ids).execute()
    course_credits = {course["code"]: course["credits"] for course in resp.data}

    remaining_requirements = {}

    # Обрабатываем каждую группу CORE-требований
    for group in groups:
        group_id = group["id"]
        group_json_id = int(group.get("json_id") or 0)
        group_name = group["name"]
        required_credits = group["req_credits"]

        # Определяем ожидаемый core-атрибут: если имя начинается с "Core ", удаляем его
        if group_name.lower().startswith("core "):
            expected_attribute = group_name[5:].strip()
        else:
            expected_attribute = group_name.strip()

        # Проходим по каждому пройденному классу и проверяем наличие ожидаемого атрибута
        allocated_courses = []
        total_taken_credits = 0
        for tc in taken_classes:
            key = (tc["course_id"], tc["term"], tc["section"])
            core_attrs = taken_class_attributes.get(key, [])
            if expected_attribute in core_attrs:
                allocated_courses.append(tc["course_id"])
                total_taken_credits += course_credits.get(tc["course_id"], 0)

        remaining_credits = max(0, required_credits - total_taken_credits)
        available_courses_str = f"CORE {required_credits}"  # для отображения, как в примере

        remaining_requirements[group_name] = {
            "json_id": group_json_id,
            "required_credits": required_credits,
            "taken_credits": total_taken_credits,
            "remaining_credits": remaining_credits,
            "taken_courses_in_group": allocated_courses,
            "available_courses": available_courses_str,
            "expected_attribute": expected_attribute
        }

        if debug:
            print(f"DEBUG for core group '{group_name}' (json_id: {group_json_id}):")
            print(f"  Expected core attribute: {expected_attribute}")
            print(f"  Taken classes matching attribute: {allocated_courses}")
            print(f"  Total taken credits: {total_taken_credits}")
            print("-" * 60)

    if full_view:
        print("\nFINAL OUTPUT:")
        for group_name, info in remaining_requirements.items():
            print(f"Group: {group_name}")
            print(f"  JSON Group ID: {info.get('json_id', 'нет')}")
            print(f"  Required Credits: {info['required_credits']}")
            print(f"  Taken Credits: {info['taken_credits']}")
            print(f"  Remaining Credits: {info['remaining_credits']}")
            print(f"  Courses Taken in Group: {', '.join(info['taken_courses_in_group'])}")
            print(f"  Available Courses: {info['available_courses']}")
            print("=" * 60)

    return remaining_requirements

# Пример списка пройденных классов (taken_classes)
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

# Вызов функции для получения информации по CORE-требованиям.
# full_view=True – выводит подробную информацию по группам.
# debug=True – печатает отладочные сообщения.
core_requirements = get_remaining_core_courses(program_name, taken_classes, full_view=True, debug=True)

# Выводим итоговый результат
print(core_requirements)
