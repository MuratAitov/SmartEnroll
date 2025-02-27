from flask import Flask, send_from_directory
from controllers.user_controller import user_bp
from controllers.major_controller import major_bp
from controllers.enrollment_controller import enrollment_bp

app = Flask(__name__, static_folder='../interface')

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/user')
app.register_blueprint(major_bp, url_prefix='/major')
app.register_blueprint(enrollment_bp, url_prefix='/enrollment')

# Serve frontend files
@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)