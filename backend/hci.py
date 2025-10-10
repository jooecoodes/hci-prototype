from flask import Flask
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/routes', methods=['GET'])
def get_routes():
    with open("D1_routes.json", "r", encoding="utf-8") as f:
        data = json.load(f)  # Step 2: Parse it
    return json.dumps(data)

@app.route('/route/<route_name>', methods=['GET'])
def get_route(route_name):
    with open("D1_routes.json", "r", encoding="utf-8") as f:
        data = json.load(f)  # Step 2: Parse it
    routes = data["jeepneyRoute"]
    for route in routes:
        if route["name"] == route_name:
            return json.dumps(route)
    return json.dumps({"error": "Route not found"}), 404

if __name__ == '__main__':    
    app.run(debug=True)
