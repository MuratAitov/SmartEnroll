# backend/app.py

from flask import Flask, request, jsonify, send_from_directory
import os

app = Flask(__name__)

# Option 1: Serve the front end from Flask (not required if you have a separate server)
# This route serves the index.html file when you visit http://localhost:5000/
@app.route('/')
def serve_index():
    return send_from_directory('../interface', 'index.html')

# This route can serve any static file (CSS, JS, images, etc.)
@app.route('/<path:filename>')
def serve_static_files(filename):
    return send_from_directory('../interface', filename)

# Example GET endpoint: fetch data
@app.route('/api/get-data', methods=['GET'])
def get_data():
    # Example data - typically you would query a database or do something dynamic
    sample_data = {
        "message": "Hello from the backend!",
        "status": "success"
    }
    return jsonify(sample_data), 200

# Example POST endpoint: receive data
@app.route('/api/post-data', methods=['POST'])
def post_data():
    incoming_data = request.json  # This is the JSON body from the front-end
    # Do something with incoming_data...
    # For example, store it in a database, run logic, etc.

    response = {
        "received": incoming_data,
        "message": "Data processed successfully!"
    }
    return jsonify(response), 201

if __name__ == '__main__':
    # Run the Flask development server
    app.run(debug=True)