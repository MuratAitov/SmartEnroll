from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Инициализация клиента Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_remaining_courses(program_name, taken_courses, full_view=False, debug=False):
    """
    Функция возвращает список курсов, необходимых для завершения программы.
    При full_view выводит подробную информацию по группам, включая дополнительное поле json_group_id как json_id.

    Логика распределения курсов:
      - Группы сортируются по возрастанию json_group_id.
      - Для каждой группы:
          potential_courses = курсы, назначенные группе.
          Для уже обработанных групп делим их распределённые курсы на две части:
             allowed_set = курсы из групп, указанных в double count flag текущей группы.
             exclusion_set = курсы из остальных групп.
          final available_courses = (potential_courses - exclusion_set) ∪ (allowed_set ∩ potential_courses)
          allocated_current = available_courses ∩ taken_courses.

    Отладочные выводы печатаются, если debug=True.

    :param program_name: Название программы
    :param taken_courses: Список пройденных курсов
    :param full_view: Если True, выводится итоговая информация по группам
    :param debug: Если True, печатаются отладочные данные
    :return: Словарь с информацией по группам
    """
    # Получаем program_id
    resp = supabase.table("programs").select("program_id").eq("degree_program", program_name).execute()
    if not resp.data:
        return {"error": "Program not found"}
    program_id = resp.data[0]["program_id"]

    # Получаем все группы требований для программы
    resp = supabase.table("requirement_groups").select("*").eq("program_id", program_id).execute()
    groups = resp.data

    # Добавляем для каждой группы поле json_id (из json_group_id) и парсим флаг double count
    for group in groups:
        group['json_id'] = group.get('json_group_id')
        note = group.get("note", "") or ""
        group["double_count_groups"] = []
        if isinstance(note, str) and "Can double count with" in note:
            try:
                parts = note.split("with")[-1].replace("(", "").replace(")", "").split(",")
                group["double_count_groups"] = [int(x.strip()) for x in parts if x.strip().isdigit()]
            except ValueError:
                group["double_count_groups"] = []

    # Сортируем группы по возрастанию json_id (приводим к int)
    groups.sort(key=lambda g: int(g.get("json_id") or 0))

    # processed_groups – список кортежей (json_id, set(allocated_courses)) для уже обработанных групп
    processed_groups = []
    remaining_requirements = {}  # Итоговый словарь с результатами

    for group in groups:
        group_id = group["id"]  # фактический id группы
        group_json_id = int(group.get("json_id") or 0)
        group_name = group["name"]
        required_credits = group["req_credits"]
        allowed_for_double = set(group["double_count_groups"])  # группы, с которыми разрешён double count

        # Получаем все курсы (potential) для текущей группы
        resp = supabase.table("requirement_courses").select("course_code").eq("group_id", group_id).execute()
        potential_courses = set(course["course_code"] for course in resp.data)

        # Получаем кредиты для курсов данной группы
        resp = supabase.table("courses").select("code, credits").in_("code", list(potential_courses)).execute()
        course_credits = {course["code"]: course["credits"] for course in resp.data}

        # Формируем allowed_set и exclusion_set из уже обработанных групп
        allowed_set = set()
        exclusion_set = set()
        for (prev_json_id, allocated_set) in processed_groups:
            if prev_json_id in allowed_for_double:
                allowed_set |= allocated_set
            else:
                exclusion_set |= allocated_set

        # Вычисляем available_courses:
        # берем курсы, которые не были распределены в exclusion_set,
        # и добавляем те, что были распределены в allowed_set (если они есть в potential)
        available_courses = (potential_courses - exclusion_set) | (allowed_set & potential_courses)

        # Вычисляем распределённые (allocated) курсы для текущей группы – только те, что студент прошёл
        allocated_current = set(course for course in taken_courses if course in available_courses)
        
        if debug:
            print(f"DEBUG for group '{group_name}' (json_id: {group_json_id}):")
            print(f"  Potential courses: {sorted(potential_courses)}")
            print(f"  Processed groups so far:")
            for prev_id, prev_alloc in processed_groups:
                print(f"    Group json_id {prev_id}: allocated = {sorted(prev_alloc)}")
            print(f"  Allowed double count groups: {sorted(allowed_for_double)}")
            print(f"  Allowed set (from allowed groups): {sorted(allowed_set)}")
            print(f"  Exclusion set (from other groups): {sorted(exclusion_set)}")
            print(f"  Final available courses: {sorted(available_courses)}")
            print(f"  Allocated (taken) courses for this group: {sorted(allocated_current)}")
            print("-" * 60)
        
        # Обновляем processed_groups для текущей группы
        processed_groups.append((group_json_id, allocated_current))

        # Для отображения available_courses (не распределённых, но потенциально доступных)
        display_available = available_courses - allocated_current

        # Считаем кредиты для распределённых курсов
        taken_credits = sum(course_credits.get(course, 0) for course in allocated_current)
        remaining_credits = max(0, required_credits - taken_credits)

        remaining_requirements[group_name] = {
            "json_id": group_json_id,
            "required_credits": required_credits,
            "taken_credits": taken_credits,
            "remaining_credits": remaining_credits,
            "taken_courses_in_group": sorted(allocated_current),
            "available_courses": sorted(display_available),
            "double_count_groups": sorted(allowed_for_double)
        }
    
    if full_view:
        print("\nFINAL OUTPUT:")
        for group_name, info in remaining_requirements.items():
            print(f"Group: {group_name}")
            print(f"  JSON Group ID: {info.get('json_id', 'нет')}")
            print(f"  Required Credits: {info['required_credits']}")
            print(f"  Taken Credits: {info['taken_credits']}")
            print(f"  Remaining Credits: {info['remaining_credits']}")
            print(f"  Courses Taken in Group: {', '.join(info['taken_courses_in_group'])}")
            print(f"  Available Courses: {', '.join(info['available_courses'])}")
            if info['double_count_groups']:
                print(f"  Can double count with groups: {info['double_count_groups']}")
            print("=" * 60)
    
    return remaining_requirements

# Пример использования
'''
taken_courses = [
    "MATH 157", "MATH 258", "MATH 231", "MATH 321", "MATH 339", "MATH 259",
    "PHYS 121L", "BIOL 106", "PHYS 122L", "MATH 328", "MATH 351", "CPSC 121",
    "CPSC 122", "CPSC 223", "CPSC 224", "CPSC 260", "CPSC 321", "CPSC 326",
    "CPSC 346", "CPSC 348", "CPSC 450", "CPSC 222", "CPSC 322", "CPSC 323",
    "CPSC 475", "CPSC 325"
]
program_name = 'B.S. Computer Science - Data Science Concentration'
get_remaining_courses(program_name, taken_courses, full_view=True, debug=False)
'''