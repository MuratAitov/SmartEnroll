# services/section_service.py

from typing import Optional
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def search_sections(subject: Optional[str] = None,
                    course_code: Optional[str] = None,
                    attribute: Optional[str] = None,
                    instructor: Optional[str] = None,
                    term: Optional[str] = "Fall 2025") -> dict:
    """
    Searches for sections in the 'sections' table using columns:
      - subject (e.g., 'CPSC')
      - course_code (e.g., '101')
      - attribute (partial match on 'attribute' column)
      - instructor (partial match on 'instructor' column)
      - term (defaults to "Fall 2025")
    
    Only applies filters if a parameter is provided (non-None).
    Returns a dictionary: either {'data': [...]} or {'error': ...}.
    """

    # Begin building the query
    query = supabase.table('sections').select('*')

    # Apply term filter
    if term:
        query = query.eq('term', term)

    if subject:
        query = query.eq('subject', subject)

    if course_code:
        query = query.eq('course_code', course_code)

    if attribute:
        query = query.ilike('attribute', f'%{attribute}%')

    if instructor:
        query = query.ilike('instructor', f'%{instructor}%')

    response = query.execute()

    return {"data": response.data}

result = search_sections(subject="CPSC", course_code='260')
print(result)
