import psycopg2
from psycopg2.extras import RealDictCursor
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'database': os.getenv('DB_NAME', 'smartenroll'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password')
}

def get_db_connection():
    try:
        # Try to connect to the database
        connection = psycopg2.connect(
            **DB_CONFIG,
            cursor_factory=RealDictCursor
        )
        logger.info("Database connection successful")
        return connection
    except psycopg2.OperationalError as e:
        logger.error(f"Could not connect to database: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected database error: {e}")
        raise

def test_db_connection():
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Test if we can query the database
            cur.execute('SELECT 1')
            # Test if our tables exist
            cur.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'courses'
                )
            """)
            has_courses_table = cur.fetchone()['exists']
            if not has_courses_table:
                logger.warning("Courses table does not exist!")
        conn.close()
        logger.info("Database connection test successful")
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False

def init_db():
    """Initialize the database with required tables"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Create tables if they don't exist
            cur.execute("""
                CREATE TABLE IF NOT EXISTS courses (
                    id SERIAL PRIMARY KEY,
                    subject VARCHAR(10) NOT NULL,
                    course_code VARCHAR(10) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    credits INTEGER NOT NULL DEFAULT 3
                )
            """)
            
            cur.execute("""
                CREATE TABLE IF NOT EXISTS sections (
                    id SERIAL PRIMARY KEY,
                    course_id INTEGER REFERENCES courses(id),
                    section_number VARCHAR(10) NOT NULL,
                    instructor VARCHAR(255),
                    meeting_days VARCHAR(50),
                    start_time TIME,
                    end_time TIME,
                    location VARCHAR(255)
                )
            """)
            
            cur.execute("""
                CREATE TABLE IF NOT EXISTS prerequisites (
                    id SERIAL PRIMARY KEY,
                    course_id INTEGER REFERENCES courses(id),
                    prerequisite_id INTEGER REFERENCES courses(id),
                    level INTEGER DEFAULT 1
                )
            """)
            
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False 