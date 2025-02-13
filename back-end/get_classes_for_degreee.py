from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Подключаемся к Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_remaining_courses(program_name, taken_courses):
    """
    Функция возвращает список курсов, которые нужно взять для завершения программы.

    :param program_name: Название программы (например, 'B.S. Computer Science - Data Science Concentration')
    :param taken_courses: Список курсов, которые студент уже прошел (например, ['CPSC 121', 'MATH 157'])
    :return: Словарь с требованиями и оставшимися курсами (учитывая кредиты и double count)
    """

    # Получаем program_id
    response = supabase.table("programs").select("program_id").eq("degree_program", program_name).execute()
    
    if not response.data:
        return {"error": "Program not found"}

    program_id = response.data[0]["program_id"]

    # Получаем requirement_groups для данной программы
    response = supabase.table("requirement_groups").select("*").eq("program_id", program_id).execute()
    requirement_groups = response.data

    remaining_requirements = {}

    for group in requirement_groups:
        group_id = group["id"]
        group_name = group["name"]
        required_credits = group["req_credits"]  # Сколько кредитов нужно набрать
        selection_type = group["selection_type"]
        note = group.get("note", "") or ""  # Обрабатываем None (если None, делаем "")

        # Получаем курсы, относящиеся к данной requirement_group
        response = supabase.table("requirement_courses").select("course_code").eq("group_id", group_id).execute()
        all_courses = [course["course_code"] for course in response.data]

        # Получаем кредиты для этих курсов
        response = supabase.table("courses").select("code, credits").in_("code", all_courses).execute()
        course_credits = {course["code"]: course["credits"] for course in response.data}

        # Вычисляем, сколько кредитов уже было набрано в этой группе
        taken_credits = sum(course_credits.get(course, 0) for course in taken_courses if course in course_credits)

        # Вычисляем оставшиеся кредиты
        remaining_credits = max(0, required_credits - taken_credits)

        # Фильтруем курсы, которые ещё не взяты
        remaining_courses = [course for course in all_courses if course not in taken_courses]

        # Если в группе есть требование на "double count"
        double_count_groups = []
        if isinstance(note, str) and "Can double count with" in note:
            try:
                double_count_groups = [int(x) for x in note.split("with")[-1].replace("(", "").replace(")", "").split(",")]
            except ValueError:
                double_count_groups = []

        # Добавляем оставшиеся курсы только если ещё нужны кредиты
        if remaining_credits > 0 and remaining_courses:
            remaining_requirements[group_name] = {
                "required_credits": required_credits,
                "taken_credits": taken_credits,
                "remaining_credits": remaining_credits,
                "available_courses": remaining_courses,
                "double_count_groups": double_count_groups
            }

    return remaining_requirements

# Пример использования
taken_courses = [ 
    "MATH 157",
    "MATH 258",
    "MATH 321",
    "MATH 259",
    "PHYS 121L",
    "PHYS 122L",
    "MATH 328",
    "MATH 351",
    "CPSC 121",
    "CPSC 122",
    "CPSC 223",
    "CPSC 224",
    "CPSC 260",
    "CPSC 321",
    "CPSC 326",
    "CPSC 346",
    "CPSC 348",
    "CPSC 450",
    "CPSC 222",
    "CPSC 322",
    "CPSC 323",
    "CPSC 475",
    "CPSC 325 "
                
                 
]
program_name = 'B.S. Computer Science - Data Science Concentration'
remaining_courses = get_remaining_courses(program_name, taken_courses)

# Выводим результат
for req, info in remaining_courses.items():
    print(f"{req}: {info['remaining_credits']} credits needed")
    print(f"Available courses: {', '.join(info['available_courses'])}")
    if info['double_count_groups']:
        print(f"Can double count with: {info['double_count_groups']}")
    print()
