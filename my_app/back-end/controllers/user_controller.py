from flask import Blueprint, request, jsonify
from services.user_service import create_user, check_login

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user_name = data.get('user_name')
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')  

    if not user_name or not email or not password or not name:
        return jsonify({"error": "Missing required fields (user_name, email, password, name)"}), 400

    result = create_user(user_name, email, password, name)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user_name = data.get('user_name')
    password = data.get('password')

    if not user_name or not password:
        return jsonify({"error": "Missing user_name or password"}), 400

    result = check_login(user_name, password)
    if "error" in result:
        return jsonify(result), 401
    return jsonify(result), 200