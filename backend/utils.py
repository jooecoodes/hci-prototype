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

def nearest_route_to_point(point, routes):
    """
    Find the route whose nearest coordinate is closest to the given point.
    Returns: (route, nearest_point)
    """
    best_route = None
    nearest_point = None
    min_dist = float('inf')
    
    for route in routes:
        for coord in route['coordinates']:
            lat, lng = coord
            dist = haversine(point[0], point[1], lat, lng)
            if dist < min_dist:
                min_dist = dist
                best_route = route
                nearest_point = coord
                
    return best_route, nearest_point


def find_routes(origin, destination, routes):
    """
    Determine possible routes for a trip from origin to destination.
    Returns a list of route(s) forming the path.
    """
    start_route, start_point = nearest_route_to_point(origin, routes)
    end_route, end_point = nearest_route_to_point(destination, routes)
    
    # Single-route trip
    if start_route['name'] == end_route['name']:
        return [start_route]
    
    # Multi-route trip: build route connections
    # Build a route graph: nodes = routes, edges = if any coordinate is within threshold (e.g., 0.2 km)
    threshold_km = 0.2
    route_graph = {r['name']: set() for r in routes}
    
    for i, r1 in enumerate(routes):
        for j, r2 in enumerate(routes):
            if i == j:
                continue
            for c1 in r1['coordinates']:
                for c2 in r2['coordinates']:
                    if haversine(c1[0], c1[1], c2[0], c2[1]) <= threshold_km:
                        route_graph[r1['name']].add(r2['name'])
                        break
                else:
                    continue
                break
    
    # BFS to find path from start_route to end_route
    from collections import deque
    visited = set()
    queue = deque([(start_route['name'], [start_route['name']])])
    
    while queue:
        current, path = queue.popleft()
        if current == end_route['name']:
            # return route objects in order
            return [next(r for r in routes if r['name'] == rn) for rn in path]
        visited.add(current)
        for neighbor in route_graph[current]:
            if neighbor not in visited:
                queue.append((neighbor, path + [neighbor]))
    
    # If no path found
    return []