# services/section_service.py

from typing import Optional
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def search_sections(subject: Optional[str] = None,
                    course_code: Optional[str] = None,
                    attribute: Optional[str] = None,
                    instructor: Optional[str] = None) -> dict:
    """
    Searches for sections in the 'sections' table using columns:
      - subject (e.g., 'CPSC')
      - course_code (e.g., '101')
      - attribute (partial match on 'attribute' column)
      - instructor (partial match on 'instructor' column)

    Only applies filters if a parameter is provided (non-None).
    Returns a dictionary: either {'data': [...]} or {'error': ...}.
    """

    # Начинаем формировать запрос
    query = supabase.table('sections').select('*')

    if subject:
        query = query.eq('subject', subject)

    if course_code:
        query = query.eq('course_code', course_code)

    if attribute:
        query = query.ilike('attribute', f'%{attribute}%')

    if instructor:
        query = query.ilike('instructor', f'%{instructor}%')

    # Выполняем запрос
    response = query.execute()

    # Проверяем статус-код
        # Успешный ответ
    return {"data": response.data}
    

# Пример вызова:
result = search_sections(subject="CPSC", course_code='260')
print(result)
