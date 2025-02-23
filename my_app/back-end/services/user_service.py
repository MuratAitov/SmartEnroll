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

    if response.error:
        return {"error": response.error.get('message', 'Unknown insert error')}

    # 4. Return the inserted record
    return {"data": response.data}

def check_login(user_name: str, password: str) -> dict:
    """
    Checks user's login credentials by comparing the provided password
    with the hashed password in the 'users' table (matched by user_name).
    Returns user data if successful, or an error otherwise.
    """
    # Find user by user_name
    response = supabase.from_('users').select('*').eq('user_name', user_name).single().execute()
    if response.error or not response.data:
        return {"error": "User not found"}

    user_record = response.data
    stored_hashed_password = user_record['password']

    # Compare the provided password with the stored hash
    if bcrypt.checkpw(password.encode('utf-8'), stored_hashed_password.encode('utf-8')):
        return {"data": user_record}  # Successful login
    else:
        return {"error": "Invalid credentials"}
    
