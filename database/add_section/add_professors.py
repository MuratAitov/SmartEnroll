import pandas as pd
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Подключаемся к Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def import_professors_from_excel(excel_file: str):
    """
    Reads an Excel file that has an 'Instructor' column,
    and adds any new professors (by name) to the 'professors' table in Supabase.
    """

    # 1. Считываем Excel
    df = pd.read_excel(excel_file, engine="openpyxl")

    # 2. Идём по каждой строке, берём имя преподавателя из столбца 'Instructor'
    for _, row in df.iterrows():
        instructor_name = str(row.get('Instructor', '')).strip()

        # Пропускаем, если пустое имя
        if not instructor_name:
            continue

        # 3. Проверяем, есть ли такой преподаватель в таблице 'professors'
        check_resp = supabase.from_('professors').select('name').eq('name', instructor_name).execute()
        
        # check_resp.data — это список записей. Если пустой => преподавателя нет
        if check_resp.data is not None and len(check_resp.data) == 0:
            # 4. Добавляем новую запись
            insert_resp = supabase.from_('professors').insert({"name": instructor_name}).execute()

            # Если библиотека поддерживает insert_resp.error:
            if hasattr(insert_resp, 'error') and insert_resp.error:
                print(f"[ERROR] Не удалось добавить преподавателя '{instructor_name}':", insert_resp.error)
            else:
                # Проверяем, добавилась ли запись
                if insert_resp.data:
                    print(f"[INFO] Добавлен преподаватель: {instructor_name}")
                else:
                    print(f"[WARNING] Неясно, добавился ли преподаватель: {instructor_name}")
        else:
            # Преподаватель уже есть
            pass

    print("[DONE] Импорт преподавателей завершён.")

if __name__ == "__main__":
    # Пример использования
    excel_path = "/Users/murataitov/VisualStudioCodeProjects/projects/SmartEnroll/data/sections/fall2025.xlsx"
    import_professors_from_excel(excel_path)
