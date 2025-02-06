from supabase import create_client, Client
from credentials import SUPABASE_URL,SUPABASE_KEY

# Твой URL и ключ Supabase

# Подключаемся к Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Пример запроса: получить все строки из таблицы "courses"
response = supabase.table("programs").select("*").execute()

# Вывод результата
print(response.data)
