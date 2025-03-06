from flask import Blueprint, jsonify, request
from datetime import datetime

export_bp = Blueprint('export_bp', __name__)

@export_bp.route('/apple-calendar', methods=['POST'])
def export_to_apple_calendar():
    try:
        data = request.get_json()
        if data.get('test'):
            return jsonify({'success': True, 'message': 'Export API is available'})
            
        # Your actual export logic here
        return jsonify({
            'success': True,
            'data': 'Calendar export successful'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500 