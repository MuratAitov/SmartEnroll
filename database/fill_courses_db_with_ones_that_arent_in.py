import os
import json
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Подключаемся к Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def process_all_json_files():
    base_dir = os.path.join(os.path.dirname(__file__), "..", "data", "prereq")

    for file_name in os.listdir(base_dir):
        if file_name.endswith(".json"):
            file_path = os.path.join(base_dir, file_name)

            # Читаем JSON-файл
            with open(file_path, "r", encoding="utf-8") as f:
                try:
                    data_list = json.load(f)  # Загружаем список курсов
                except json.JSONDecodeError as e:
                    print(f"Ошибка чтения JSON из файла {file_name}: {e}")
                    continue

            # Обрабатываем каждый курс в файле
            for data in data_list:
                name_value = data.get("name", "").strip()
                term_value = data.get("term")

                # Разбираем имя курса
                code_parts = name_value.split()
                if len(code_parts) < 2:
                    continue  # Пропускаем, если название странное

                course_code = f"{code_parts[0]} {code_parts[1]}"  # Код курса (пример: "CPEN 230")
                title = course_code  # Заголовок = первые два слова
                description = " ".join(code_parts[2:]) if len(code_parts) > 2 else ""  # Описание
                department = code_parts[0]  # Первое слово = департамент

                try:
                    # Проверяем, существует ли курс в базе
                    response = supabase.table("courses").select("code").eq("code", course_code).execute()

                    if response.data:
                        continue  # Курс уже есть, пропускаем

                    # Если курса нет, добавляем его
                    new_course = {
                        "code": course_code,
                        "title": title,
                        "description": description,
                        "department": department,
                        "term": term_value if term_value else None
                    }

                    insert_resp = supabase.table("courses").insert(new_course).execute()
                    print(f"✅ Добавлен новый курс: {course_code} (из '{name_value}')")

                except Exception as ex:
                    print(f"❌ Ошибка при добавлении курса {course_code} из файла {file_name}: {ex}")

if __name__ == "__main__":
    process_all_json_files()
