from flask import Blueprint, jsonify, request
from database import get_db_connection

graph_bp = Blueprint('graph_bp', __name__)

@graph_bp.route('/graph', methods=['GET'])
def get_prerequisites():
    try:
        course = request.args.get('course')
        all_levels = request.args.get('all', 'false').lower() == 'true'
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Query prerequisites based on course and all_levels parameter
        if all_levels:
            cur.execute('SELECT * FROM prerequisites WHERE course_id = %s', (course,))
        else:
            cur.execute('SELECT * FROM prerequisites WHERE course_id = %s AND level = 1', (course,))
            
        prerequisites = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': prerequisites
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 