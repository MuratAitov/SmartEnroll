from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Course Blueprint
from blueprints.course_bp import course_bp
app.register_blueprint(course_bp, url_prefix='/course_bp')

# Export Blueprint
from blueprints.export_bp import export_bp
app.register_blueprint(export_bp, url_prefix='/export_bp')

# Graph/Prerequisite Blueprint
from blueprints.graph_bp import graph_bp
app.register_blueprint(graph_bp, url_prefix='/api')

# Section Blueprint
from blueprints.section_bp import section_bp
app.register_blueprint(section_bp, url_prefix='/section_bp')

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not Found'}), 404

@app.errorhandler(405)
def method_not_allowed_error(error):
    return jsonify({'error': 'Method Not Allowed'}), 405

if __name__ == '__main__':
    app.run(debug=True, port=5001) 