#!/usr/bin/env python3
import os
import json
import glob
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Подключаемся к Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_response_dict(response):
    """
    Возвращает ответ в виде словаря, используя model_dump() (Pydantic v2) или dict().
    """
    if hasattr(response, "model_dump"):
        return response.model_dump()
    else:
        return response.dict()

def resolve_course_codes(course_code: str):
    """
    Если course_code содержит символы 'x' или 'X', трактует его как шаблон.
    Преобразует, например, "CPSC 4xx" в SQL-шаблон "CPSC 4__" и выполняет запрос в таблицу courses.
    Возвращает список найденных course codes.
    Если шаблон не обнаружен или course_code не содержит 'x'/'X', проверяет наличие точного совпадения.
    """
    if "x" in course_code.lower():
        # Преобразуем шаблон: сначала заменяем "xx" на "__", затем оставшиеся "x"/"X" на "_"
        pattern = course_code.replace("xx", "__").replace("XX", "__")
        pattern = pattern.replace("X", "_").replace("x", "_")
        response = supabase.table("courses").select("code").ilike("code", pattern).execute()
        response_dict = get_response_dict(response)
        if response_dict.get("error"):
            print("Ошибка запроса courses для шаблона", pattern, ":", response_dict.get("error"))
            return []
        return [item["code"] for item in response_dict.get("data", [])]
    else:
        # Если шаблона нет — ищем точное совпадение
        response = supabase.table("courses").select("code").eq("code", course_code).execute()
        response_dict = get_response_dict(response)
        if response_dict.get("error"):
            print("Ошибка запроса courses для кода", course_code, ":", response_dict.get("error"))
            return []
        if response_dict.get("data"):
            return [course_code]
        else:
            return []

def process_json_file(json_file: str):
    print("Обработка файла:", json_file)
    with open(json_file, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Ошибка декодирования JSON файла {json_file}: {e}")
            return

    # Извлекаем основные данные программы
    degree_program = data.get("degree_program")
    college = data.get("college")
    academic_year = data.get("academic_year")
    requirements = data.get("requirements", {})
    language_requirement = requirements.get("language_requirement")

    # Проверка обязательных полей
    if not degree_program or not college or not academic_year:
        print(f"Файл {json_file} пропущен: отсутствуют обязательные поля (degree_program, college или academic_year)")
        return

    # Определяем тип программы: если в названии есть "minor" — minor, иначе major.
    # Для major дополнительно определяем наличие "concentration".
    if "minor" in degree_program.lower():
        program_type = "minor"
        has_concentration = None
    else:
        program_type = "major"
        has_concentration = "concentration" in degree_program.lower()

    program_data = {
        "degree_program": degree_program,
        "college": college,
        "academic_year": academic_year,
        "language_requirement": language_requirement,
        "program_type": program_type,
        "has_concentration": has_concentration
    }

    print("Вставка записи программы:", program_data)
    program_response = supabase.table("programs").insert(program_data).execute()
    program_response_dict = get_response_dict(program_response)
    if program_response_dict.get("error"):
        print("Ошибка вставки программы:")
        print("  Данные программы:", program_data)
        print("  Ответ:", program_response_dict.get("error"))
        return

    inserted_program = program_response_dict.get("data")[0]
    program_id = inserted_program.get("program_id")
    print(f"Вставлена программа '{degree_program}' с program_id = {program_id} (program_type: {program_type}, has_concentration: {has_concentration})")

    # Обработка групп требований
    req_groups = requirements.get("req_groups", [])
    for group in req_groups:
        group_data = {
            "program_id": program_id,
            "json_group_id": group.get("id"),
            "name": group.get("name"),
            "req_credits": group.get("req_credits"),
            "selection_type": group.get("selection_type"),
            "note": group.get("note")
        }
        group_response = supabase.table("requirement_groups").insert(group_data).execute()
        group_response_dict = get_response_dict(group_response)
        if group_response_dict.get("error"):
            print("Ошибка вставки группы требований:")
            print("  Данные группы:", group_data)
            print("  Ответ:", group_response_dict.get("error"))
            continue

        inserted_group = group_response_dict.get("data")[0]
        group_id = inserted_group.get("id")
        print(f"  Вставлена группа '{group.get('name')}' с id = {group_id}")

        # Обработка курсов в группе
        classes = group.get("classes", [])
        for course in classes:
            original_course_code = course.get("course_code", "").strip()
            is_exclusion = False
            if original_course_code.startswith("-"):
                is_exclusion = True
                original_course_code = original_course_code.replace("-", "").strip()

            # Получаем список реальных кодов курсов, соответствующих шаблону (если применимо)
            resolved_codes = resolve_course_codes(original_course_code)
            if not resolved_codes:
                print(f"    Ошибка: курс '{original_course_code}' не найден в таблице courses.")
            else:
                for actual_code in resolved_codes:
                    course_data = {
                        "group_id": group_id,
                        "course_code": actual_code,
                        "is_exclusion": is_exclusion
                    }
                    course_response = supabase.table("requirement_courses").insert(course_data).execute()
                    course_response_dict = get_response_dict(course_response)
                    if course_response_dict.get("error"):
                        print("    Ошибка вставки курса:")
                        print("      Данные курса:", course_data)
                        print("      Ответ:", course_response_dict.get("error"))
                    else:
                        print(f"    Вставлен курс '{actual_code}' (исключение: {is_exclusion})")

def process_all_json_files():
    base_dir = os.path.join(os.path.dirname(__file__), "..", "data", "degree_req")
    json_files = glob.glob(os.path.join(base_dir, "**", "*.json"), recursive=True)
    json_files += glob.glob(os.path.join(base_dir, "**", "*.JSON"), recursive=True)

    if not json_files:
        print("JSON-файлы не найдены в директории:", base_dir)
        return

    for json_file in json_files:
        process_json_file(json_file)

def main():
    print("=== Обработка JSON-файлов и вставка данных в базу ===")
    process_all_json_files()

if __name__ == "__main__":
    main()



