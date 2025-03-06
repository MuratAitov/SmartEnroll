from flask import Blueprint, jsonify, Flask
from services.db_service import DatabaseService
from flask_cors import CORS

course_bp = Blueprint('course_bp', __name__)

app = Flask(__name__)
CORS(app)

@course_bp.route('/courses', methods=['GET'])
def get_courses():
    courses = DatabaseService.get_courses()
    if courses is not None:
        return jsonify({"success": True, "data": courses}), 200
    return jsonify({"success": False, "error": "Failed to fetch courses"}), 500

@course_bp.route('/sections/<course_id>', methods=['GET'])
def get_sections(course_id):
    sections = DatabaseService.get_sections(course_id)
    if sections is not None:
        return jsonify({"success": True, "data": sections}), 200
    return jsonify({"success": False, "error": "Failed to fetch sections"}), 500

@course_bp.route('/professors', methods=['GET'])
def get_professors():
    professors = DatabaseService.get_professors()
    if professors is not None:
        return jsonify({"success": True, "data": professors}), 200
    return jsonify({"success": False, "error": "Failed to fetch professors"}), 500 