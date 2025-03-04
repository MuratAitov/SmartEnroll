# controllers/section_controller.py

from flask import Blueprint, request, jsonify
from services.section_service import search_sections

section_bp = Blueprint('section_bp', __name__)

@section_bp.route('/search', methods=['GET'])
def search():
    """
    Endpoint for filtering sections in real time.
    Example of usage (query params):
    GET /sections/search?subject=CPSC&course_code=101&attribute=Core&instructor=Smith
    """
    subject = request.args.get('subject')     
    course_code = request.args.get('course_code')
    attribute = request.args.get('attribute')
    instructor = request.args.get('instructor')

    result = search_sections(subject, course_code, attribute, instructor)
    return jsonify(result), 200
