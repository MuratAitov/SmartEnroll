import math
import pandas as pd
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def convert_nan_to_none(value):
    """
    Заменяет NaN на None, иначе возвращает исходное значение.
    """
    if isinstance(value, float) and math.isnan(value):
        return None
    return value

def parse_int_value(val):
    """
    Преобразует val в int, если это возможно:
      - float вида 3.0 -> 3
      - строка вида '5' -> 5
      - строка вида '0-3' -> 0 (если у тебя есть такие случаи)
      - иначе возвращает None (или исходное значение, по желанию)
    """
    if val is None:
        return None

    # Если float типа 3.0
    if isinstance(val, float):
        if val.is_integer():
            return int(val)
        else:
            # Округлить или вернуть None — зависит от логики
            return int(round(val))

    # Если строка
    if isinstance(val, str):
        # Если встречаются случаи '0-3', берем левую часть
        if '-' in val:
            left_part = val.split('-', 1)[0].strip()
            try:
                return int(left_part)
            except ValueError:
                return None
        else:
            try:
                return int(val)
            except ValueError:
                return None

    # Если уже int
    if isinstance(val, int):
        return val

    # Иначе
    return None

def import_fall2025_data(excel_file: str):
    # Считываем Excel
    df = pd.read_excel(excel_file, engine="openpyxl")

    rows_to_insert = []

    # Все столбцы, которые в Supabase являются integer
    # Обязательно укажи их так, как они называются в Excel
    int_columns = [
        'Cap', 'Act', 'Rem',
        'WL Cap', 'WL Act', 'WL Rem',
        'XL Cap', 'XL Act', 'XL Rem',
        'Credits'  # Если 'Credits' тоже int
    ]

    for _, row in df.iterrows():
        row_dict = {}
        for col in df.columns:
            raw_val = row[col]
            raw_val = convert_nan_to_none(raw_val)

            # Если столбец — integer, приводим к int
            if col in int_columns:
                raw_val = parse_int_value(raw_val)

            row_dict[col] = raw_val

        # Разбираем 'Course'
        course_value = str(row_dict.get('Course', '')).strip()
        course_parts = course_value.split('-')

        if len(course_parts) >= 2:
            subject = course_parts[0]
            course_code = course_parts[1]
            section = course_parts[2] if len(course_parts) > 2 else ""
            course_id = f"{subject} {course_code}"
        else:
            subject = course_value
            course_code = ""
            section = ""
            course_id = subject

        # Формируем запись для вставки
        record = {
            "crn": row_dict.get('CRN'),
            "course_id": course_id,
            "credits": row_dict.get('Credits'),
            "days": row_dict.get('Days'),
            "time_slot": row_dict.get('Time'),
            "cap": row_dict.get('Cap'),
            "act": row_dict.get('Act'),
            "rem": row_dict.get('Rem'),
            "wl_cap": row_dict.get('WL Cap'),
            "wl_act": row_dict.get('WL Act'),
            "wl_rem": row_dict.get('WL Rem'),
            "xl_cap": row_dict.get('XL Cap'),
            "xl_act": row_dict.get('XL Act'),
            "xl_rem": row_dict.get('XL Rem'),
            "instructor_id": row_dict.get('Instructor'),
            "dates": row_dict.get('Dates'),
            "classroom": row_dict.get('Classroom'),
            "attribute": row_dict.get('Attribute'),
            "term": row_dict.get('Term'),
            "subject": subject,
            "course_code": course_code,
            "section": section
        }
            
        rows_to_insert.append(record)

    # Вставляем
    response = supabase.from_('sections').insert(rows_to_insert).execute()

    # Смотрим, есть ли 'data'
    if not hasattr(response, 'data') or not response.data:
        print("[ERROR?] Похоже, что нет данных об успешно вставленных строках. Полный ответ:")
        print(response)
    else:
        print("[SUCCESS] Data inserted:", response.data)


if __name__ == "__main__":
    import_fall2025_data("/Users/murataitov/VisualStudioCodeProjects/projects/SmartEnroll/data/sections/fall2025.xlsx")
