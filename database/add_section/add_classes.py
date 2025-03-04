import math
import pandas as pd
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Подключаемся к Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def convert_nan_to_none(value):
    """
    Заменяет NaN на None, иначе возвращает исходное значение.
    """
    if isinstance(value, float) and math.isnan(value):
        return None
    return value

def parse_code(course_value: str) -> str:
    """
    Принимает строку вида 'CPSC-260-01' и возвращает 'CPSC 260'.
    Игнорирует всё после второго дефиса.
    Если дефис один: 'CPSC-260' -> 'CPSC 260'.
    Если нет дефисов: возвращает как есть.
    """
    parts = course_value.split('-')
    if len(parts) >= 2:
        subject = parts[0]          # 'CPSC'
        course_num = parts[1]       # '260'
        # Склеиваем с пробелом
        return f"{subject} {course_num}"
    else:
        return course_value.strip()

def parse_credits(value):
    """
    Преобразует значение Credits в целое число, если это возможно.
    Например, '0-3' -> 0, '3.0' -> 3, '4' -> 4, иначе None.
    """
    if value is None:
        return None

    # Если float, округляем или берём целую часть
    if isinstance(value, float):
        if value.is_integer():
            return int(value)
        else:
            return int(round(value))

    # Если строка
    if isinstance(value, str):
        # Проверяем, есть ли дефис (например, '0-3')
        if '-' in value:
            left_part = value.split('-', 1)[0].strip()
            try:
                return int(left_part)
            except ValueError:
                return None
        else:
            # Пытаемся напрямую преобразовать строку в int
            try:
                return int(value)
            except ValueError:
                return None

    # Если уже int
    if isinstance(value, int):
        return value

    return None

def import_courses_from_excel(excel_file: str):
    """
    Считывает Excel с колонками:
      - 'Course' (например, 'CPSC-260-01'),
      - 'Title',
      - 'Credits'
    и добавляет (при необходимости) записи в таблицу 'courses':
      code (например, 'CPSC 260'),
      title,
      credits.
    """

    # 1. Считываем Excel
    df = pd.read_excel(excel_file, engine="openpyxl")

    for _, row in df.iterrows():
        # 2. Достаём нужные поля из Excel
        raw_course = str(row.get('Course', '')).strip()
        raw_title = str(row.get('Title', '')).strip()
        raw_credits = row.get('Credits', None)

        # Пропускаем, если нет 'Course'
        if not raw_course:
            continue

        # 3. Преобразуем
        code = parse_code(raw_course)        # 'CPSC 260'
        title = raw_title                   # Просто берём из 'Title'
        credits = convert_nan_to_none(raw_credits)
        credits = parse_credits(credits)     # например, '0-3' -> 0

        # 4. Проверяем, есть ли уже такой course code в таблице 'courses'
        check_resp = supabase.from_('courses').select('code').eq('code', code).execute()
        # Предположим, check_resp.data содержит список
        if check_resp.data and len(check_resp.data) > 0:
            # Запись уже существует
            # Можно, например, пропустить или обновить
            # pass
            print(f"[SKIP] Course '{code}' уже есть в таблице 'courses'.")
        else:
            # 5. Вставляем новую запись
            insert_data = {
                "code": code,
                "title": title,
                "credits": credits
                # Если нужно, можно заполнить department, term, description, etc.
            }
            insert_resp = supabase.from_('courses').insert(insert_data).execute()

            # Проверяем, как выглядит insert_resp
            # Если в твоей версии supabase-py есть insert_resp.data:
            if hasattr(insert_resp, 'data') and insert_resp.data:
                print(f"[INFO] Добавлен новый курс: {code} ({title}), credits={credits}")
            else:
                print(f"[WARNING] Неясно, добавился ли курс {code}. См. ответ:", insert_resp)

    print("[DONE] Импорт курсов завершён.")

if __name__ == "__main__":
    excel_path = "/Users/murataitov/VisualStudioCodeProjects/projects/SmartEnroll/data/sections/fall2025.xlsx"
    import_courses_from_excel(excel_path)
