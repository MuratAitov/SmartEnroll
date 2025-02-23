import os
from flask import Flask, send_from_directory

app = Flask(__name__)


INTERFACE_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'interface')

@app.route('/')
def serve_index():
    return send_from_directory(INTERFACE_FOLDER, 'index.html')

@app.route('/<path:filename>')
def serve_static_files(filename):
    return send_from_directory(INTERFACE_FOLDER, filename)

if __name__ == '__main__':

    app.run(debug=True, port=5001)