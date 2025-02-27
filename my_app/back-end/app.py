import os
from flask import Flask, send_from_directory
from controllers.user_controller import user_bp
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Register the user blueprint
app.register_blueprint(user_bp, url_prefix='/user')

INTERFACE_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'interface')

@app.route('/')
def serve_index():
    return send_from_directory(INTERFACE_FOLDER, 'index.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    return send_from_directory(INTERFACE_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5001)