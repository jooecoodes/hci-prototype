from flask import Flask, request
from flask_cors import CORS
import json
import utils

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

@app.route('/dist', methods=['GET'])
def get_distance():
    params = request.args
    lat = float(params.get('lat'))
    lon = float(params.get('lng'))
    route = params.get('route')

    with open("D1_routes.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    routes = data["jeepneyRoute"]

    for r in routes:
        if r["name"] == route:
            coordinates = r["coordinates"]

            # find the nearest coordinate in the route
            nearest_point = min(
                coordinates,
                key=lambda coord: utils.haversine(lat, lon, coord[0], coord[1])
            )
            distance = utils.haversine(lat, lon, nearest_point[0], nearest_point[1])

            print(f"Clicked near: {nearest_point}, Distance: {distance:.3f} km from route '{route}'")
            return json.dumps({
                "nearest_point": nearest_point,
                "distance_km": distance
            })

    return json.dumps({"error": "Route not found"}), 404
if __name__ == '__main__':    
    app.run(debug=True)
