from flask import Blueprint, request, jsonify
from services.prereq_service import build_prerequisite_graph

# Create blueprint with a URL prefix
prereq_bp = Blueprint('prereq_bp', __name__, url_prefix='/api')

@prereq_bp.route('/graph', methods=['GET'])
def get_prereq_graph():
    course = request.args.get('course')
    all_levels = request.args.get('all', 'false').lower() == 'true'

    if not course:
        return jsonify({"error": "Missing 'course' parameter"}), 400

    result = build_prerequisite_graph(course_code=course, include_all_levels=all_levels)
    return jsonify(result), 200