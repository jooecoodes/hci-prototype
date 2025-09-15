import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ChevronDownIcon, XMarkIcon, MapPinIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// Fix Leaflet marker icons issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Create custom icons
const createCustomIcon = (color) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="12" r="4" fill="white"/>
        <path d="M16,28 C10,20 10,20 16,12 C22,20 22,20 16,28 Z" fill="white"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const originIcon = createCustomIcon("#3B82F6");
const destinationIcon = createCustomIcon("#EF4444");
const currentLocationIcon = createCustomIcon("#10B981");

// Route data with multiple routes
const jeepneyRoutes = [
  {
    name: "R1",
    color: "blue",
    coordinates: [
      [8.484665, 124.656636],
      [8.484851, 124.655751],
      [8.484929, 124.655412],
      [8.485046, 124.654917],
      [8.485172, 124.654325],
      [8.485830, 124.651227],
      [8.486099, 124.650136],
      [8.486187, 124.649662],
      [8.486237, 124.649511],
      [8.486191, 124.649367],
      [8.486532, 124.647793],
      [8.486714, 124.646982],
      [8.487057, 124.645708],
      [8.488537, 124.641061],
      [8.488953, 124.639791],
      [8.488901, 124.639653],
      [8.487166, 124.639042],
      [8.486091, 124.638788],
      [8.484747, 124.638449],
      [8.484585, 124.638597],
      [8.483255, 124.638495],
      [8.481772, 124.638288],
      [8.481061, 124.638133],
      [8.480555, 124.638027],
      [8.480094, 124.637951],
      [8.479126, 124.637864],
      [8.476614, 124.637845],
      [8.475949, 124.642334],
      [8.475583, 124.642571],
    ]
  },
  {
    name: "R2",
    color: "green",
    coordinates: [
      [8.480, 124.650],
      [8.479, 124.649],
      [8.478, 124.648],
      [8.477, 124.647],
      [8.476, 124.646],
      [8.475, 124.645],
      [8.474, 124.644],
      [8.474, 124.643],
      [8.474, 124.642],
      [8.474, 124.641],
      [8.474, 124.640],
      [8.475, 124.639],
      [8.476, 124.638],
      [8.477, 124.637],
      [8.478, 124.636],
      [8.479, 124.635],
      [8.480, 124.634],
      [8.481, 124.633],
      [8.482, 124.632],
      [8.483, 124.631],
    ]
  },
    {
    name: "WESTBOUND TERMINAL TO AGORA MARKET",
      color: "red",
    coordinates:[[8.51213, 124.62424], [8.51196, 124.62425], 
    [8.51187, 124.62426], [8.51166, 124.62427], 
    [8.51089, 124.62431], [8.50851, 124.62435], 
    [8.50777, 124.62437], [8.50659, 124.62449], 
    [8.50656, 124.62449], [8.5064, 124.62451], 
    [8.50606, 124.62453], [8.50539, 124.62452], 
    [8.5049, 124.62448], [8.50455, 124.62444], 
    [8.50457, 124.62428], [8.50458, 124.62421], 
    [8.50458, 124.62416], [8.50459, 124.62402], 
    [8.5046, 124.62386], [8.5046, 124.62362], 
    [8.50455, 124.62194], [8.50454, 124.62145], 
    [8.50453, 124.62112], [8.50451, 124.62076], 
    [8.5045, 124.62052], [8.5045, 124.62024], 
    [8.50449, 124.61998], [8.50449, 124.6199], 
    [8.50448, 124.61981], [8.50448, 124.61956], 
    [8.50447, 124.61942], [8.50446, 124.6192], 
    [8.50445, 124.61897], [8.50444, 124.61882], 
    [8.50442, 124.61823], [8.50441, 124.61804], 
    [8.50438, 124.61796], [8.50437, 124.61775], 
    [8.50436, 124.61761], [8.50436, 124.61734], 
    [8.50434, 124.61695], [8.50434, 124.61644], 
    [8.50434, 124.61638], [8.50432, 124.61589], 
    [8.5043, 124.61558], [8.50429, 124.61531], 
    [8.50429, 124.61526], [8.50428, 124.6149], 
    [8.50428, 124.61483], [8.50427, 124.61442],
     [8.50425, 124.61367], [8.50422, 124.61298]
     , [8.50421, 124.61275], [8.5042, 124.61232], 
     [8.50417, 124.61184], [8.50416, 124.61169], 
     [8.50408, 124.61084], [8.50407, 124.6107], 
     [8.50398, 124.60961], [8.50398, 124.60958], 
     [8.50394, 124.60911], [8.5039, 124.60855], 
     [8.50387, 124.60827], [8.50385, 124.60802], 
     [8.50384, 124.60797], [8.50383, 124.60777], 
     [8.50379, 124.60735], [8.50391, 124.60734], 
     [8.50392, 124.60747], [8.50381, 124.60747], 
     [8.50371, 124.60748], [8.50372, 124.60767], 
     [8.50373, 124.6077], [8.50373, 124.60772], 
     [8.50374, 124.60773], [8.50375, 124.60774], 
     [8.50376, 124.60775], [8.50383, 124.60777], 
     [8.50384, 124.60797], [8.50385, 124.60802], 
     [8.50387, 124.60827], [8.5039, 124.60855], 
     [8.50394, 124.60911], [8.50398, 124.60958], 
     [8.50398, 124.60961], [8.50407, 124.6107], 
     [8.50408, 124.61084], [8.50416, 124.61169], 
     [8.50417, 124.61184], [8.5042, 124.61232], 
     [8.50421, 124.61275], [8.50422, 124.61298], 
     [8.50425, 124.61367], [8.50427, 124.61442], 
     [8.50428, 124.61483], [8.50428, 124.6149], 
     [8.50429, 124.61526], [8.50429, 124.61531],
      [8.5043, 124.61558], [8.50432, 124.61589],
       [8.50434, 124.61638], [8.50434, 124.61644],
        [8.50434, 124.61695], [8.50436, 124.61734],
         [8.50436, 124.61761], [8.50437, 124.61775],
          [8.50438, 124.61796], [8.50435, 124.61805],
           [8.50434, 124.61809], [8.50434, 124.61822],
            [8.50435, 124.61871], [8.50435, 124.61924],
             [8.50436, 124.61946], [8.50437, 124.61964], ]
            }

    ];

// Haversine distance helper
function haversineDistance(coord1, coord2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(coord2[0] - coord1[0]);
  const dLon = toRad(coord2[1] - coord1[1]);
  const lat1 = toRad(coord1[0]);
  const lat2 = toRad(coord2[0]);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find the nearest point on any route to a given location
function findNearestRoutePoint(location, routes) {
  let minDist = Infinity;
  let closestRoute = null;
  let closestPoint = null;
  let closestIndex = -1;

  for (const route of routes) {
    for (let i = 0; i < route.coordinates.length; i++) {
      const coord = route.coordinates[i];
      const dist = haversineDistance(location, coord);
      if (dist < minDist) {
        minDist = dist;
        closestRoute = route;
        closestPoint = coord;
        closestIndex = i;
      }
    }
  }

  return { route: closestRoute, point: closestPoint, index: closestIndex, distance: minDist };
}

// Find the best route between two points
function findBestRoute(origin, destination, routes) {
  const originNearest = findNearestRoutePoint(origin, routes);
  const destinationNearest = findNearestRoutePoint(destination, routes);

  // If both points are on the same route
  if (originNearest.route.name === destinationNearest.route.name) {
    const route = originNearest.route;
    const startIndex = Math.min(originNearest.index, destinationNearest.index);
    const endIndex = Math.max(originNearest.index, destinationNearest.index);
    const path = route.coordinates.slice(startIndex, endIndex + 1);
    
    return [{
      route: route.name,
      color: route.color,
      path: path,
      from: originNearest.point,
      to: destinationNearest.point,
      distance: calculatePathDistance(path)
    }];
  } else {
    // For demo purposes, we'll create a transfer point
    const transferPoint = [8.478, 124.642]; // A point where both routes are close
    
    const firstLeg = {
      route: originNearest.route.name,
      color: originNearest.route.color,
      path: getPathToPoint(originNearest, transferPoint, originNearest.route),
      from: originNearest.point,
      to: transferPoint,
      distance: calculatePathDistance(getPathToPoint(originNearest, transferPoint, originNearest.route))
    };
    
    const secondLeg = {
      route: destinationNearest.route.name,
      color: destinationNearest.route.color,
      path: getPathToPoint(findNearestRoutePoint(transferPoint, [destinationNearest.route]), destinationNearest.point, destinationNearest.route),
      from: transferPoint,
      to: destinationNearest.point,
      distance: calculatePathDistance(getPathToPoint(findNearestRoutePoint(transferPoint, [destinationNearest.route]), destinationNearest.point, destinationNearest.route))
    };
    
    return [firstLeg, secondLeg];
  }
}

// Helper function to get path to a point
function getPathToPoint(startInfo, endPoint, route) {
  const endInfo = findNearestRoutePoint(endPoint, [route]);
  const startIndex = Math.min(startInfo.index, endInfo.index);
  const endIndex = Math.max(startInfo.index, endInfo.index);
  return route.coordinates.slice(startIndex, endIndex + 1);
}

// Calculate total distance of a path
function calculatePathDistance(path) {
  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    totalDistance += haversineDistance(path[i-1], path[i]);
  }
  return totalDistance;
}

// A hook to detect clicks and set markers
function MapEvents({ setOrigin, setDestination, mode }) {
  useMapEvents({
    click(e) {
      if (mode === "origin") {
        setOrigin([e.latlng.lat, e.latlng.lng]);
      } else if (mode === "destination") {
        setDestination([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

// Component to recenter map when needed
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

function Map() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState(null);
  const [panelState, setPanelState] = useState("collapsed");
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);
  const [mode, setMode] = useState("origin"); // "origin" or "destination"
  const [geoError, setGeoError] = useState(null);
  const panelRef = useRef(null);
  const dragHandleRef = useRef(null);

  const defaultPosition = [8.4542, 124.6318];

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setGeoError(null);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation([latitude, longitude]);
          setOrigin([latitude, longitude]);
          setMode("destination");
          setLoading(false);
          setPanelState("half");
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoading(false);
          setGeoError("Unable to access your location. Please check your browser permissions or manually select a location on the map.");
        },
        {
          timeout: 10000,
          enableHighAccuracy: true
        }
      );
    } else {
      setGeoError("Geolocation is not supported by this browser. Please manually select a location on the map.");
    }
  };

  // Calculate route
  useEffect(() => {
    if (origin && destination) {
      setLoading(true);
      setRouteResult(null);

      const timer = setTimeout(() => {
        const result = findBestRoute(origin, destination, jeepneyRoutes);
        setRouteResult(result);
        setLoading(false);
        setPanelState("half");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [origin, destination]);

  const handleClear = () => {
    setOrigin(null);
    setDestination(null);
    setCurrentLocation(null);
    setRouteResult(null);
    setMode("origin");
    setPanelState("collapsed");
    setGeoError(null);
  };

  // Handle touch events for dragging the panel
  const handleTouchStart = useCallback((e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    
    let currentHeight = 0;
    if (panelState === "collapsed") currentHeight = 10;
    else if (panelState === "half") currentHeight = 50;
    else currentHeight = 90;
    
    setStartHeight(currentHeight);
  }, [panelState]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    const newHeight = Math.min(90, Math.max(10, startHeight + (diff / window.innerHeight) * 100));
    
    if (panelRef.current) {
      panelRef.current.style.transform = `translateY(${100 - newHeight}%)`;
    }
  }, [isDragging, startY, startHeight]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (panelRef.current) {
      const computedStyle = window.getComputedStyle(panelRef.current);
      const matrix = new DOMMatrixReadOnly(computedStyle.transform);
      const currentTranslateY = matrix.m42;
      const panelHeight = panelRef.current.offsetHeight;
      const visiblePercentage = (1 - currentTranslateY / panelHeight) * 100;
      
      if (visiblePercentage < 30) {
        setPanelState("collapsed");
      } else if (visiblePercentage < 70) {
        setPanelState("half");
      } else {
        setPanelState("full");
      }
      
      panelRef.current.style.transform = '';
    }
  }, [isDragging]);

  // Add event listeners for dragging
  useEffect(() => {
    const handle = dragHandleRef.current;
    if (!handle) return;

    handle.addEventListener('touchstart', handleTouchStart, { passive: true });
    handle.addEventListener('touchmove', handleTouchMove, { passive: true });
    handle.addEventListener('touchend', handleTouchEnd);

    return () => {
      handle.removeEventListener('touchstart', handleTouchStart);
      handle.removeEventListener('touchmove', handleTouchMove);
      handle.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getPanelClass = () => {
    let baseClasses = "fixed md:relative bottom-0 left-0 right-0 md:h-full md:w-96 bg-gray-900 text-white p-6 shadow-2xl transform transition-transform duration-300 z-40 md:translate-x-0 rounded-t-2xl md:rounded-none";
    
    if (isDragging) {
      return `${baseClasses}`;
    }
    
    if (panelState === "collapsed") {
      return `${baseClasses} translate-y-[90%] md:translate-y-0 md:transform-none`;
    } else if (panelState === "half") {
      return `${baseClasses} translate-y-1/2 md:translate-y-0 md:transform-none`;
    } else if (panelState === "full") {
      return `${baseClasses} translate-y-0 md:translate-y-0 md:transform-none`;
    }
  };

  return (
    <div className="flex h-screen w-screen relative">
      {/* Map Container */}
      <MapContainer center={defaultPosition} zoom={13} className="h-full w-full z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Current location marker */}
        {currentLocation && (
          <Marker position={currentLocation} icon={currentLocationIcon}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}

        {/* Origin marker */}
        {origin && !currentLocation && (
          <Marker position={origin} icon={originIcon}>
            <Popup>Origin</Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destination && (
          <Marker position={destination} icon={destinationIcon}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {/* Route lines */}
        {jeepneyRoutes.map((route) => (
          <Polyline 
            key={route.name} 
            positions={route.coordinates} 
            color={route.color} 
            weight={3} 
            opacity={0.7}
          />
        ))}

        {/* Route result lines */}
        {routeResult && routeResult.map((leg, index) => (
          <Polyline
            key={index}
            positions={leg.path}
            color={leg.color}
            weight={6}
            opacity={0.9}
          />
        ))}

        <MapEvents setOrigin={setOrigin} setDestination={setDestination} mode={mode} />
        <RecenterMap position={origin || defaultPosition} />
      </MapContainer>

      {/* Floating Panel */}
      <div ref={panelRef} className={getPanelClass()}>
        {/* Panel Drag Handle */}
        <div 
          ref={dragHandleRef}
          className="flex justify-center md:hidden touch-none cursor-grab active:cursor-grabbing"
        >
          <div className="w-12 h-1.5 bg-gray-600 rounded-full my-2"></div>
        </div>

        {/* Panel Content */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">🚍 Jeepney Route Finder</h2>
            {(origin || destination) && (
              <button 
                onClick={handleClear}
                className="md:hidden p-1 rounded-full bg-gray-700 hover:bg-gray-600"
                aria-label="Clear"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          {!origin && !destination && (
            <div className="flex flex-col space-y-4">
              <p className="text-gray-300">Plan your jeepney route</p>
              
              <button
                onClick={getCurrentLocation}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
                <span>Use My Current Location</span>
              </button>
              
              <div className="relative flex items-center justify-center my-4">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-700"></div>
              </div>
              
              <button
                onClick={() => setMode("origin")}
                className="flex items-center justify-center space-x-2 bg-gray-700 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                <MapPinIcon className="w-5 h-5" />
                <span>Select Origin on Map</span>
              </button>

              {geoError && (
                <div className="mt-4 p-3 bg-red-900 rounded-lg">
                  <p className="text-red-200 text-sm">{geoError}</p>
                </div>
              )}
            </div>
          )}

          {origin && !destination && (
            <div className="flex flex-col space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-green-400 font-medium">✓ Origin set</p>
                <p className="text-sm text-gray-400 mt-1">
                  {currentLocation ? "Using your current location" : "Origin selected on map"}
                </p>
              </div>
              
              <button
                onClick={() => setMode("destination")}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <MapPinIcon className="w-5 h-5" />
                <span>Select Destination on Map</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-4 py-6 text-center">
              <div className="inline-flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
              <p className="text-blue-400 font-medium mt-3">
                Finding best jeepney route...
              </p>
            </div>
          )}

          {routeResult && !loading && (
            <div className="mt-4 bg-gray-800 p-5 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-3">Recommended Route</h3>
              
              <div className="space-y-4">
                {routeResult.map((leg, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold" style={{backgroundColor: leg.color}}>
                        {index + 1}
                      </div>
                      <div className="font-semibold">Jeepney {leg.route}</div>
                    </div>
                    <p className="text-sm text-gray-300">
                      Distance: <span className="font-semibold text-green-400">{leg.distance.toFixed(2)} km</span>
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 bg-gray-700 p-3 rounded-lg">
                <h4 className="font-medium text-gray-300 mb-2">Directions</h4>
                <ol className="list-decimal list-inside text-sm space-y-1 text-gray-300">
                  <li>Start from your {currentLocation ? "current location" : "selected origin"}</li>
                  {routeResult.length === 1 ? (
                    <li>Take Jeepney {routeResult[0].route} to your destination</li>
                  ) : (
                    <>
                      <li>Take Jeepney {routeResult[0].route} to the transfer point</li>
                      <li>Transfer to Jeepney {routeResult[1].route} to your destination</li>
                    </>
                  )}
                  <li>Alert the driver when you're near your destination</li>
                </ol>
              </div>
              
              <button
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-4"
                onClick={handleClear}
              >
                Plan New Route
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop toggle button */}
      <button 
        onClick={() => setPanelState(panelState === "collapsed" ? "half" : "collapsed")}
        className="hidden md:flex absolute top-4 right-4 bg-gray-900 text-white p-3 rounded-full shadow-lg z-30 hover:bg-gray-800 transition-colors"
        aria-label="Toggle panel"
      >
        <ChevronDownIcon className={`w-5 h-5 transform transition-transform ${panelState === "collapsed" ? "rotate-180" : ""}`} />
      </button>

      {/* Mode indicator */}
      <div className="absolute top-4 left-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-30">
        {mode === "origin" ? "Select origin on map" : "Select destination on map"}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white mt-4 text-lg font-medium">
              Finding best route...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Map;
