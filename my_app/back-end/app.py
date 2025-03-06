import os
from flask import Flask, send_from_directory
from flask_cors import CORS

# Import controllers
from controllers.user_controller import user_bp
from controllers.course_controller import course_bp
from controllers.export_controller import export_bp
from controllers.prereq_controller import prereq_bp
from controllers.section_controller import section_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register Blueprints with Correct URL Prefixes
app.register_blueprint(user_bp, url_prefix='/user')
app.register_blueprint(course_bp, url_prefix='/courses')  # /courses now correctly routes
app.register_blueprint(section_bp, url_prefix='/sections')  # /sections now correctly routes
app.register_blueprint(export_bp, url_prefix='/export')  # /export now correctly routes
app.register_blueprint(prereq_bp, url_prefix='/api')  # Fixing prereq_bp path

# Serve Frontend Files
INTERFACE_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'interface')

@app.route('/')
def serve_index():
    return send_from_directory(INTERFACE_FOLDER, 'index.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    return send_from_directory(INTERFACE_FOLDER, filename)

# Fix for missing favicon.ico to prevent 404 errors
@app.route('/favicon.ico')
def serve_favicon():
    return send_from_directory(INTERFACE_FOLDER, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

if __name__ == '__main__':
    app.run(debug=True, port=5001)
