from flask import Blueprint, jsonify, request
from database import get_db_connection

section_bp = Blueprint('section_bp', __name__)

@section_bp.route('/search', methods=['GET'])
def search_sections():
    try:
        # Get search parameters
        subject = request.args.get('subject')
        course_code = request.args.get('course_code')
        instructor = request.args.get('instructor')
        attribute = request.args.get('attribute')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Build the query based on provided parameters
        query = 'SELECT * FROM sections WHERE 1=1'
        params = []
        
        if subject:
            query += ' AND subject = %s'
            params.append(subject)
        if course_code:
            query += ' AND course_code = %s'
            params.append(course_code)
        if instructor:
            query += ' AND instructor ILIKE %s'
            params.append(f'%{instructor}%')
        if attribute:
            query += ' AND attributes ILIKE %s'
            params.append(f'%{attribute}%')
            
        cur.execute(query, tuple(params))
        sections = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': sections
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 