from flask import Blueprint, jsonify, request
from database import get_db_connection

course_bp = Blueprint('course_bp', __name__)

@course_bp.route('/courses', methods=['GET'])
def get_courses():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM courses')
        courses = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': courses
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@course_bp.route('/sections/<course_id>', methods=['GET'])
def get_sections(course_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('SELECT * FROM sections WHERE course_id = %s', (course_id,))
        sections = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'sections': sections
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 