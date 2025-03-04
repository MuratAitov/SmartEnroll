import pandas as pd
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Убедись, что установил нужные пакеты:
# pip install pandas openpyxl supabase

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def import_fall2025_data(excel_file: str):
    """
    Reads the Excel file (fall2025.xlsx), parses the 'Course' column
    into subject/course_code, and inserts all columns into 'sections'.
    """

    # 1. Считываем Excel в DataFrame
    df = pd.read_excel(excel_file)  # По умолчанию engine='openpyxl' для .xlsx

    # Ожидаем, что в Excel-файле есть следующие столбцы:
    # CRN, Course, Title, Credits, Days, Time, Cap, Act, Rem,
    # WL Cap, WL Act, WL Rem, XL Cap, XL Act, XL Rem,
    # Instructor, Dates, Classroom, Attribute, Term
    #
    # Если названия отличаются, нужно подправить код.

    rows_to_insert = []

    for _, row in df.iterrows():
        # 2. Разбиваем колонку 'Course' на subject / course_code
        course_value = str(row.get('Course', '')).strip()
        if ' ' in course_value:
            parts = course_value.split(' ', 1)
            subject = parts[0]
            course_code = parts[1]
        else:
            subject = course_value
            course_code = ''

        # 3. Формируем словарь для вставки
        record = {
            "crn": row.get('CRN'),
            "course": course_value,              # Полностью
            "title": row.get('Title'),
            "credits": row.get('Credits'),
            "days": row.get('Days'),
            "time": row.get('Time'),
            "cap": row.get('Cap'),
            "act": row.get('Act'),
            "rem": row.get('Rem'),
            "wl_cap": row.get('WL Cap'),
            "wl_act": row.get('WL Act'),
            "wl_rem": row.get('WL Rem'),
            "xl_cap": row.get('XL Cap'),
            "xl_act": row.get('XL Act'),
            "xl_rem": row.get('XL Rem'),
            "instructor": row.get('Instructor'),
            "dates": row.get('Dates'),
            "classroom": row.get('Classroom'),
            "attribute": row.get('Attribute'),
            "term": row.get('Term'),

            # Добавляем новые столбцы subject/course_code
            "subject": subject,
            "course_code": course_code
        }

        rows_to_insert.append(record)

    # Выполняем bulk insert
    response = supabase.from_('sections').insert(rows_to_insert).execute()

    if response.error:
        print("Error inserting data:", response.error)
    else:
        print("Data inserted successfully!")

if __name__ == "__main__":
    import_fall2025_data("fall2025.xlsx")
