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
                name_value = data.get("name", "")
                term_value = data.get("term")

                # Пропускаем, если term=None или пустая строка
                if not term_value:
                    continue

                # Извлекаем код курса (первые два "слова")
                code_parts = name_value.split()
                if len(code_parts) >= 2:
                    course_code = f"{code_parts[0]} {code_parts[1]}"
                else:
                    course_code = name_value.strip()

                try:
                    # Проверяем, существует ли такой курс в базе
                    response = supabase.table("courses").select("code").eq("code", course_code).execute()

                    # Теперь response — объект APIResponse, доступ к данным через .data
                    if not response.data:
                        print(f"❌ Не найден курс '{course_code}' (из '{name_value}') в файле {file_name}")
                        continue

                    # Обновляем поле term в базе данных
                    update_resp = supabase.table("courses").update({"term": term_value}).eq("code", course_code).execute()

                    print(f"✅ Курс {course_code} (из '{name_value}') обновлен: term='{term_value}'")

                except Exception as ex:
                    print(f"❌ Ошибка при обработке курса {course_code} из файла {file_name}: {ex}")

if __name__ == "__main__":
    process_all_json_files()
