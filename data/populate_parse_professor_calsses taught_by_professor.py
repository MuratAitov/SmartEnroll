import os
import pandas as pd
import re
from datetime import datetime
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Подключаемся к Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def parse_int_value(val):
    """
    Преобразует val к int.
    - Если val None/NaN -> None
    - Если val float (например, 48.0) -> 48
    - Если val строка "48.0" -> 48
    - Если val строка "3-4" или "0-3", берём левую часть (3, 0)
    - Если не удаётся -> None
    """
    if val is None:
        return None

    if isinstance(val, float):
        if pd.isna(val):
            return None
        return int(val)

    if isinstance(val, int):
        return val

    if isinstance(val, str):
        # Случай "3-4" или "0-3"
        if "-" in val:
            left_part = val.split("-")[0]
            try:
                return int(left_part)
            except ValueError:
                return None
        # Случай "48.0" -> 48
        try:
            f = float(val)
            if pd.isna(f):
                return None
            return int(f)
        except ValueError:
            return None

    return None

def parse_course_and_section(course_str: str):
    """
    Парсит строку вида "ACCT-260-01 Principles..."
    1) Берём первое слово -> "ACCT-260-01"
    2) Меняем дефисы на пробел -> "ACCT 260 01"
    3) Разбиваем -> ["ACCT", "260", "01"]
    4) Возвращаем ("ACCT 260", "01")
    """
    if not course_str:
        return (None, None)
    first_word = course_str.split()[0]  # "ACCT-260-01"
    replaced = first_word.replace('-', ' ')
    tokens = replaced.split()
    if len(tokens) < 3:
        return (None, None)
    course_id = tokens[0] + " " + tokens[1]  # "ACCT 260"
    section = tokens[2]                     # "01"
    return (course_id, section)

def parse_term_and_year(term_str: str):
    """
    Разбивает "Fall 2023" -> ("Fall", 2023)
    Если не удаётся, возвращает (None, None).
    """
    match = re.match(r"(Fall|Spring|Summer)\s+(\d{4})", str(term_str))
    if not match:
        return (None, None)
    season, year_str = match.groups()  # например, "Fall", "2023"
    try:
        year_int = int(year_str)
    except ValueError:
        return (None, None)
    return (season, year_int)

# Папка с Excel-файлами
folder_path = "/Users/murataitov/VisualStudioCodeProjects/projects/SmartEnroll/data/sections"
files = [f for f in os.listdir(folder_path) if f.endswith(".xlsx")]
total_files = len(files)
if total_files == 0:
    print("Не найдено Excel-файлов для обработки!")
    exit()

# Список для хранения ошибок
errors = []

print(f"Найдено файлов: {total_files}")

required_columns = [
    "CRN", "Course", "Credits", "Days", "Time", "Cap", "Act", "Rem",
    "WL Cap", "WL Act", "WL Rem", "XL Cap", "XL Act", "XL Rem",
    "Instructor", "Dates", "Classroom", "Attribute", "Term"
]

for idx, file in enumerate(files, start=1):
    progress_percent = (idx - 1) / total_files * 100
    print(f"\n[{progress_percent:.2f}%] Обрабатываем файл {idx}/{total_files}: {file}")

    file_path = os.path.join(folder_path, file)
    df = pd.read_excel(file_path)
    # Заменяем NaN -> None
    df = df.where(pd.notnull(df), None)

    # Проверяем, есть ли нужные колонки
    if not all(col in df.columns for col in required_columns):
        msg = f"⚠️ В файле {file} нет нужных колонок. Пропускаем."
        print(msg)
        errors.append(msg)
        continue

    # Обрабатываем каждую строку
    for _, row in df.iterrows():
        crn = str(row["CRN"]) if row["CRN"] else None
        course_str = row["Course"]
        # ВАЖНО: используем parse_int_value для Credits
        credits_val = parse_int_value(row["Credits"])
        days = str(row["Days"]) if row["Days"] else None
        time_slot = str(row["Time"]) if row["Time"] else None
        cap = parse_int_value(row["Cap"])
        act = parse_int_value(row["Act"])
        rem = parse_int_value(row["Rem"])
        wl_cap = parse_int_value(row["WL Cap"])
        wl_act = parse_int_value(row["WL Act"])
        wl_rem = parse_int_value(row["WL Rem"])
        xl_cap = parse_int_value(row["XL Cap"])
        xl_act = parse_int_value(row["XL Act"])
        xl_rem = parse_int_value(row["XL Rem"])
        instructor = str(row["Instructor"]) if row["Instructor"] else "Unknown"
        dates = row["Dates"]
        classroom = row["Classroom"]
        attribute = row["Attribute"]
        term_str = row["Term"]

        # Разбираем "Fall 2023"
        season, year_int = parse_term_and_year(term_str)
        if not season or not year_int:
            msg = f"❌ Не удалось распарсить Term: {term_str} (CRN={crn})"
            print(msg)
            errors.append(msg)
            continue

        # Разбираем "ACCT-260-01"
        course_id, section_num = parse_course_and_section(str(course_str))

        # 1) Сначала создаём/ищем преподавателя
        professor_entry = {"name": instructor}
        try:
            res = supabase.table("professors").select("professor_id").eq("name", instructor).execute()
            if res.data:
                professor_id = res.data[0]["professor_id"]
            else:
                new_prof = supabase.table("professors").insert(professor_entry).execute()
                professor_id = new_prof.data[0]["professor_id"]
        except Exception as e:
            err_msg = f"Ошибка в professors: {e}\nprofessor_entry= {professor_entry}"
            print(err_msg)
            errors.append(err_msg)
            continue

        # 2) Теперь вставляем запись в sections
        section_data = {
            "crn": crn,
            "course_id": course_id,
            "section": section_num,
            "credits": credits_val,  # Теперь целое число (или None)
            "days": days,
            "time_slot": time_slot,
            "cap": cap,
            "act": act,
            "rem": rem,
            "wl_cap": wl_cap,
            "wl_act": wl_act,
            "wl_rem": wl_rem,
            "xl_cap": xl_cap,
            "xl_act": xl_act,
            "xl_rem": xl_rem,
            "instructor_id": instructor,  # Связь с professors.name
            "dates": dates,
            "classroom": classroom,
            "attribute": attribute,
            "term": f"{season} {year_int}"  # Пример: "Fall 2023"
        }

        try:
            supabase.table("sections").insert(section_data).execute()
        except Exception as e:
            err_msg = f"Ошибка при вставке в sections: {e}\nsection_data= {section_data}"
            print(err_msg)
            errors.append(err_msg)
            continue

        # (Не заполняем professor_courses_taught в этом коде)

    print(f"Файл {file} обработан.")

print("\n[100.00%] Все файлы обработаны!")

# Итоговый отчёт об ошибках
if errors:
    print("\n=== ОТЧЁТ ОБ ОШИБКАХ ===")
    print(f"Всего ошибок: {len(errors)}")
    for i, err in enumerate(errors, start=1):
        print(f"\nОшибка #{i}: {err}")
else:
    print("\nВсе вставки прошли успешно, ошибок нет!")