from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY
from collections import defaultdict

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_remaining_courses(program_name, taken_courses, full_view=False):
    """
    Функция возвращает список курсов, которые нужно взять для завершения программы.
    В режиме full_view показывает все данные о группах и курсах.

    :param program_name: Название программы
    :param taken_courses: Список уже взятых курсов
    :param full_view: Если True, показывает подробную информацию
    :return: Словарь с требованиями и оставшимися курсами
    """

    # Получение program_id
    response = supabase.table("programs").select("program_id").eq("degree_program", program_name).execute()
    if not response.data:
        return {"error": "Program not found"}
    program_id = response.data[0]["program_id"]

    # Получение всех групп требований и разделение на элективные и неэлективные
    response = supabase.table("requirement_groups").select("*").eq("program_id", program_id).execute()
    all_groups = response.data
    non_electives = []
    electives = []
    for group in all_groups:
        if "Elective" in group["name"]:
            electives.append(group)
        else:
            non_electives.append(group)

    remaining_requirements = {}
    course_usage = defaultdict(set)  # Трекинг курсов, использованных в неэлективах

    # Обработка неэлективных групп первыми
    for group in non_electives:
        group_id = group["id"]
        group_name = group["name"]
        required_credits = group["req_credits"]
        note = group.get("note", "") or ""

        # Получение курсов в группе
        response = supabase.table("requirement_courses").select("course_code").eq("group_id", group_id).execute()
        all_courses = [course["course_code"] for course in response.data]

        # Получение кредитов для курсов
        response = supabase.table("courses").select("code, credits").in_("code", all_courses).execute()
        course_credits = {course["code"]: course["credits"] for course in response.data}

        # Определение взятых курсов в группе
        taken_in_group = [course for course in taken_courses if course in all_courses]
        taken_credits = sum(course_credits.get(course, 0) for course in taken_in_group)
        remaining_credits = max(0, required_credits - taken_credits)

        # Отслеживание использования курса в неэлективных группах
        for course in taken_in_group:
            course_usage[course].add(group_id)

        remaining_requirements[group_name] = {
            "required_credits": required_credits,
            "taken_credits": taken_credits,
            "remaining_credits": remaining_credits,
            "available_courses": [c for c in all_courses if c not in taken_courses],
            "taken_courses_in_group": taken_in_group,
            "double_count_groups": []
        }

    # Обработка элективных групп
    for group in electives:
        group_id = group["id"]
        group_name = group["name"]
        required_credits = group["req_credits"]
        note = group.get("note", "") or ""

        # Парсинг групп для двойного учета
        double_count_groups = []
        if isinstance(note, str) and "Can double count with" in note:
            try:
                parts = note.split("with")[-1].replace("(", "").replace(")", "").split(",")
                double_count_groups = [int(x.strip()) for x in parts]
            except ValueError:
                double_count_groups = []

        # Получение курсов в группе
        response = supabase.table("requirement_courses").select("course_code").eq("group_id", group_id).execute()
        all_courses = [course["course_code"] for course in response.data]

        # Получение кредитов для курсов
        response = supabase.table("courses").select("code, credits").in_("code", all_courses).execute()
        course_credits = {course["code"]: course["credits"] for course in response.data}

        # Определение подходящих курсов с учетом двойного учета
        eligible_courses = []
        for course in all_courses:
            if course in taken_courses:
                if course not in course_usage:
                    eligible_courses.append(course)
                else:
                    # Проверка, разрешен ли двойной учет с группами, где курс уже использован
                    used_groups = course_usage[course]
                    if any(gid in double_count_groups for gid in used_groups):
                        eligible_courses.append(course)

        # Расчет кредитов
        taken_credits = sum(course_credits.get(course, 0) for course in eligible_courses)
        remaining_credits = max(0, required_credits - taken_credits)

        remaining_requirements[group_name] = {
            "required_credits": required_credits,
            "taken_credits": taken_credits,
            "remaining_credits": remaining_credits,
            "available_courses": [c for c in all_courses if c not in taken_courses],
            "taken_courses_in_group": eligible_courses,
            "double_count_groups": double_count_groups
        }

    # Вывод результатов
    if full_view:
        for req, info in remaining_requirements.items():
            print(f"Requirement: {req}")
            print(f"Required Credits: {info['required_credits']}")
            print(f"Taken Credits: {info['taken_credits']}")
            print(f"Remaining Credits: {info['remaining_credits']}")
            print(f"Courses Taken in Group: {', '.join(info['taken_courses_in_group'])}")
            print(f"Available Courses: {', '.join(info['available_courses'])}")
            if info['double_count_groups']:
                print(f"Can double count with groups: {info['double_count_groups']}")
            print("="*60)
    else:
        for req, info in remaining_requirements.items():
            if info['remaining_credits'] > 0:
                print(f"{req}: {info['remaining_credits']} credits needed")
                print(f"Available courses: {', '.join(info['available_courses'])}")
                if info['double_count_groups']:
                    print(f"Can double count with: {info['double_count_groups']}")
                print()

    return remaining_requirements

# Пример использования
taken_courses = [ 
    "MATH 157", "MATH 258", "MATH 231", "MATH 321", "MATH 339", "MATH 259",
    "PHYS 121L", "BIOL 106", "PHYS 122L", "MATH 328", "MATH 351", "CPSC 121",
    "CPSC 122", "CPSC 223", "CPSC 224", "CPSC 260", "CPSC 321", "CPSC 326",
    "CPSC 346", "CPSC 348", "CPSC 450", "CPSC 222", "CPSC 322", "CPSC 323",
    "CPSC 475", "CPSC 325"
]
program_name = 'B.S. Computer Science - Data Science Concentration'

get_remaining_courses(program_name, taken_courses, full_view=True)