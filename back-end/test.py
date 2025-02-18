from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def build_double_count_dict(program_name):
    response = supabase.table("programs").select("program_id").eq("degree_program", program_name).execute()
    if not response.data:
        return {"error": "Program not found"}

    program_id = response.data[0]["program_id"]
    response = supabase.table("requirement_groups").select("json_group_id", "note").eq("program_id", program_id).execute()
    requirement_groups = sorted(response.data, key=lambda x: x['json_group_id'])

    double_count_dict = {}
    for group in requirement_groups:
        note = group.get("note", "") or ""
        current_id = group["json_group_id"]
        double_count_groups = []
        if isinstance(note, str) and "Can double count with" in note:
            try:
                double_count_groups = [int(x) for x in note.split("with")[-1].replace("(", "").replace(")", "").split(",")]
            except ValueError:
                double_count_groups = []
        if double_count_groups:
            double_count_dict[current_id] = set(double_count_groups)

    reversed_dict = {}
    for key, values in double_count_dict.items():
        for value in values:
            if value not in reversed_dict:
                reversed_dict[value] = set()
            reversed_dict[value].add(key)

    return reversed_dict

def get_remaining_courses(program_name, taken_courses, full_view=False):
    double_count_dict = build_double_count_dict(program_name)

    response = supabase.table("programs").select("program_id").eq("degree_program", program_name).execute()
    program_id = response.data[0]["program_id"]
    response = supabase.table("requirement_groups").select("*").eq("program_id", program_id).execute()
    requirement_groups = sorted(response.data, key=lambda x: x['json_group_id'])

    all_taken_courses = set(taken_courses)
    remaining_requirements = {}

    for group in requirement_groups:
        group_id = group["json_group_id"]
        response = supabase.table("requirement_courses").select("course_code").eq("group_id", group["id"]).execute()
        all_courses = [course["course_code"] for course in response.data]

        taken_in_group = set(all_taken_courses.intersection(all_courses))
        taken_credits = len(taken_in_group)

        if group_id in double_count_dict:
            for linked_id in double_count_dict[group_id]:
                if linked_id in remaining_requirements:
                    taken_in_group -= remaining_requirements[linked_id]["taken_courses_in_group"]

        remaining_credits = max(0, group["req_credits"] - taken_credits)
        remaining_courses = [course for course in all_courses if course not in all_taken_courses]

        if taken_credits > 0 or remaining_credits > 0:
            remaining_requirements[group_id] = {
                "required_credits": group["req_credits"],
                "taken_credits": taken_credits,
                "remaining_credits": remaining_credits,
                "available_courses": remaining_courses,
                "taken_courses_in_group": taken_in_group,
            }

    if full_view:
        for group_id, info in remaining_requirements.items():
            print(f"Requirement Group {group_id}")
            print(f"Required Credits: {info['required_credits']}")
            print(f"Taken Credits: {info['taken_credits']}")
            print(f"Remaining Credits: {info['remaining_credits']}")
            print(f"Courses Taken: {', '.join(info['taken_courses_in_group'])}")
            print(f"Available Courses: {', '.join(info['available_courses'])}")
            print("="*60)

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
