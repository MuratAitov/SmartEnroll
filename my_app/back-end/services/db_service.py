from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class DatabaseService:
    @staticmethod
    def get_courses():
        """
        Fetches all courses from the database
        """
        try:
            response = supabase.from_('courses').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error fetching courses: {str(e)}")
            return None

    @staticmethod
    def get_sections(course_id):
        """
        Fetches all sections for a specific course
        """
        try:
            response = supabase.from_('sections').select('*').eq('course_id', course_id).execute()
            return response.data
        except Exception as e:
            print(f"Error fetching sections for course {course_id}: {str(e)}")
            return None

    @staticmethod
    def get_professors():
        """
        Fetches all professors from the database
        """
        try:
            response = supabase.from_('professors').select('*').execute()
            return response.data
        except Exception as e:
            print(f"Error fetching professors: {str(e)}")
            return None 