from flask import Flask, request
from flask_cors import CORS
import json
import utils

app = Flask(__name__)
CORS(app)

routes_path = "routes_District_all.json"


@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/routes', methods=['GET'])
def get_routes():
    with open(routes_path, "r", encoding="utf-8") as f:
        data = json.load(f)  # Step 2: Parse it
    return json.dumps(data)

@app.route('/route/<route_name>', methods=['GET'])
def get_route(route_name):
    with open(routes_path, "r", encoding="utf-8") as f:
        data = json.load(f)  # Step 2: Parse it
    routes = data["jeepneyRoute"]
    for route in routes:
        if route["name"] == route_name:
            return json.dumps(route)
    return json.dumps({"error": "Route not found"}), 404

@app.route('/dist/specific', methods=['GET'])
def get_distance():
    params = request.args
    lat = float(params.get('lat'))
    lon = float(params.get('lng'))
    route = params.get('route')

    with open(routes_path, "r", encoding="utf-8") as f:
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

@app.route('/dist/jeeps', methods=['GET'])
def get_jeep():
    params = request.args
    latA = float(params.get('lat'))
    lngA = float(params.get('lng'))
    latB = float(params.get('lat2'))
    lngB = float(params.get('lng2'))
    
    with open(routes_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    routes = data["jeepneyRoute"]

    
    minLat = min(latA, latB)  # always bottom
    maxLat = max(latA, latB)  # always top
    minLng = min(lngA, lngB)  # always left
    maxLng = max(lngA, lngB)  # always right
    
    candidate_routes = []
    
    for route in routes:
        # check if any point of this route is inside the bounding box
        for coord in route['coordinates']:
            lat, lng = coord
            if minLat <= lat <= maxLat and minLng <= lng <= maxLng:
                # this route passes through the area
                candidate_routes.append(route)
                break  # no need to check further points
    
    print("lat, lon:", latA, lngB)
    print("lat2, lon2:", latA, lngB)
    print(f"Found {len(candidate_routes)} candidate routes in the area.")

    
    return candidate_routes;

    
if __name__ == '__main__':    
    app.run(debug=True)
