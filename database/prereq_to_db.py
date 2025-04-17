import os
import json
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

# Ensure required package is installed:
# pip install supabase

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Folder containing JSON files per school
data_folder = '/Users/murataitov/VisualStudioCodeProjects/projects/SmartEnroll/data/prereq'


def import_prerequisites():
    """
    Iterate over each JSON file in data_folder and upsert every course's prerequisites directly.
    """
    for filename in os.listdir(data_folder):
        if not filename.endswith('.json'):
            continue

        path = os.path.join(data_folder, filename)
        with open(path, 'r', encoding='utf-8') as f:
            courses = json.load(f)

        for course in courses:
            name = course.get('name', '')
            parts = name.split()
            if len(parts) < 2:
                continue
            code = f"{parts[0]} {parts[1]}"

            prereq = course.get('prerequisites')
            if not prereq:
                continue

            # Direct upsert into 'prerequisites' table
            supabase.from_('prerequisites').upsert([
                {
                    'course_code': code,
                    'prerequisite_schema': prereq
                }
            ], on_conflict='course_code').execute()
            print(f"Upserted {code}")


if __name__ == '__main__':
    import_prerequisites()
