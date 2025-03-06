import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    try:
        return psycopg2.connect(
            host="localhost",
            database="smartenroll",  # Update this with your database name
            user="postgres",         # Update this with your database user
            password="password"      # Update this with your database password
        )
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        raise e 