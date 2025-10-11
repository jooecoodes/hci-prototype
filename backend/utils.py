from math import radians, sin, cos, sqrt, atan2

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

def hello_world():
    return 'Hello from utils!'  

def slice_route(segment, origin, destination):
    """
    Slice a route segment from origin to destination direction.
    Returns the part of the route moving toward destination.
    """
    latA, lonA = origin
    latB, lonB = destination

    # Determine directions
    north = latB > latA
    east  = lonB > lonA

    sliced = []
    for lat, lon in segment:
        if north and lat >= latA:
            sliced.append((lat, lon))
        elif not north and lat <= latA:
            sliced.append((lat, lon))
        if east and lon >= lonA:
            sliced.append((lat, lon))
        elif not east and lon <= lonA:
            sliced.append((lat, lon))
    return sliced

def filter_relevant_routes(origin, destination, candidate_routes,
                           initial_distance=0.2, increment=0.1, max_distance=5.0):
    """
    Return routes that have at least one point close enough to the destination.
    Gradually expands search radius if no routes are found.
    """
    distance = initial_distance

    while distance <= max_distance:
        relevant_routes = []

        for route in candidate_routes:
            coords = route['coordinates']

            # Find the closest point in the route to the destination
            closest_point = min(coords, key=lambda c: haversine(c[0], c[1], destination[0], destination[1]))
            dist_to_dest = haversine(closest_point[0], closest_point[1], destination[0], destination[1])

            if dist_to_dest <= distance:
                relevant_routes.append({
                    'name': route['name'],
                    'coordinates': coords,  # keep full route
                    'distance_to_dest_km': dist_to_dest
                })

        # Sort by distance to destination (closest first)
        relevant_routes.sort(key=lambda x: x['distance_to_dest_km'])

        if relevant_routes:
            return relevant_routes

        # Increase search distance
        distance += increment
        print(f"No relevant routes found, increasing search distance to {distance:.1f} km")

    return []
