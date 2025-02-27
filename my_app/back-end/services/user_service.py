import bcrypt
from supabase import create_client, Client
from credentials import SUPABASE_URL, SUPABASE_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_user(user_name: str, email: str, password: str, name: str) -> dict:
    """
    Creates a new user in the 'users' table with a unique user_name, a hashed password, and a display name.
    Automatically assigns user_id (auto-increment).
    Returns the inserted user data or an error if user_name is already taken.
    """

    # 1. Check if user_name already exists
    check_response = supabase.from_('users').select('*').eq('user_name', user_name).execute()
    if check_response.data:
        return {"error": f"user_name '{user_name}' is already in use."}

    # 2. Hash the password using bcrypt
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    # 3. Insert new user (user_id is auto-incremented by the DB)
    insert_data = {
        "user_name": user_name,
        "email": email,
        "password": hashed_password,
        "name": name
    }
    response = supabase.from_('users').insert(insert_data).execute()

    if not response.data or "error" in response.data:
        return {"error": response.data.get("error", "Unknown insert error")}


    # 4. Return the inserted record
    return {"data": response.data}

def check_login(user_name: str, password: str) -> dict:
    """
    Checks user's login credentials by comparing the provided password
    with the hashed password in the 'users' table (matched by user_name).
    Returns user data if successful, or an error otherwise.
    """
    try:
        # Find user by user_name
        response = supabase.from_('users').select('*').eq('user_name', user_name).single().execute()
        
        # Check if we got any data back
        if not response.data:
            return {"error": "User not found"}

        user_record = response.data
        stored_hashed_password = user_record['password']

        # Compare the provided password with the stored hash
        if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password.encode('utf-8')):
            # Remove password from user data before sending
            user_data = dict(user_record)
            user_data.pop('password', None)
            return {"data": user_data}  # Successful login
        else:
            return {"error": "Invalid credentials"}
            
    except Exception as e:
        print(f"Login error: {str(e)}")  # For debugging
        return {"error": "An error occurred during login"}
    
#result = create_user("Aa", "aa@gmail.com", "Aa", "Aa")
#print (result)
##add class (course_id, term = default , section (table = sections - column -> section) , )
def add_class(user_id: int, course_id: str, section_id: int) -> dict:
    """
    Adds a class for a user in the 'enrollments' table, ensuring that the user is not already enrolled in the same course.

    :param user_id: ID of the user
    :param course_id: ID of the course
    :param section_id: ID of the course section
    :return: Dictionary with success message or error
    """

    # Step 1: Check if the user exists
    user_check = supabase.from_("users").select("user_id").eq("user_id", user_id).execute()
    if not user_check.data:
        return {"error": f"User with ID {user_id} does not exist."}

    # Step 2: Check if the section exists and get its course_id
    section_check = supabase.from_("sections").select("section_id, course_id").eq("section_id", section_id).execute()
    if not section_check.data:
        return {"error": f"Section with ID {section_id} does not exist."}

    # Ensure the provided course_id matches the section's course_id
    section_course_id = section_check.data[0]["course_id"]
    if section_course_id != course_id:
        return {"error": f"Section {section_id} does not belong to course {course_id}."}

    # Step 3: Check if the user is already enrolled in this course in any section
    enrollment_check = (
        supabase.from_("enrollments")
        .select("section_id")
        .eq("user_id", user_id)
        .execute()
    )
    
    if enrollment_check.data:
        # Get all section IDs where the user is enrolled
        enrolled_section_ids = {record["section_id"] for record in enrollment_check.data}

        # Check if the user is already enrolled in a section of the same course
        existing_course_check = supabase.from_("sections").select("section_id").eq("course_id", course_id).in_("section_id", list(enrolled_section_ids)).execute()

        if existing_course_check.data:
            return {"error": f"User {user_id} is already enrolled in a section of course {course_id}."}

    # Step 4: Insert into enrollments
    insert_data = {
        "user_id": user_id,
        "section_id": section_id,
    }
    response = supabase.from_("enrollments").insert(insert_data).execute()

    # Step 5: Check for errors
    if not response.data:
        return {"error": "Failed to enroll in class. Supabase response: " + str(response)}

    return {"success": f"User {user_id} enrolled in Section {section_id} for Course {course_id}."}

# Example Usage
#result = add_class(user_id=1, course_id="ACCT 260", section_id=493)

# Print the result
#print(result)
