import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; 
import axios from "axios";

const routeName = "Directions from FH58+9F, Cagayan de Oro, Misamis Oriental, Philippines to FJJP+3WJ, Ipil St, Cagayan de Oro, 9000 Misamis Oriental, Philippines";

// Leaflet icon fix (necessary for default markers to show correctly in modern bundlers)
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ routeName }) {
  const [clickedLatLng, setClickedLatLng] = useState(null);

  useMapEvents({
    click(e) {
      console.log("Clicked:", e.latlng);
      setClickedLatLng(e.latlng); // store click
    },
  });

  useEffect(() => {
    if (!clickedLatLng) return;

    axios
      .get("http://localhost:5000/dist", {
        params: {
          lat: clickedLatLng.lat,
          lng: clickedLatLng.lng,
          route: routeName,
        },
      })
      .then((res) => console.log(res.data))
      .catch((err) => console.error("Error:", err));

  }, [clickedLatLng, routeName]); // run when click changes

  return null;
}


const MapComponent = () => {
  // Coordinates for Cagayan de Oro (latitude, longitude)
  const cdoPosition = [8.4842, 124.6472];
  const initialZoom = 13; 

  const [routes, setRoutes] = useState([]);


  // Encode the route name so special characters (spaces, commas, etc.) are safe in a URL
  const encodedName = encodeURIComponent(routeName);
  
  useEffect(() => {
    axios
      .get(`http://localhost:5000/route/${encodedName}`)
      .then((response) => setRoutes(response.data["coordinates"]))
      .catch((error) => console.error("Error:", error));
  }, [routeName])

   // Coordinates for the Polyline (our route)
  const cdoRouteCoordinates = [
    [8.4746, 124.6468], // Point A: Near Divisoria
    [8.4795, 124.6490], // Point B: Along CM Recto Ave
    [8.4835, 124.6450], // Point C: Near Limketkai Center
  ];

  // Options to style the polyline (using Leaflet's Path options)
  const polylineOptions = { 
    color: 'red',        // Color of the line
    weight: 5,           // Thickness of the line
    opacity: 0.8,        // Transparency
    lineJoin: 'round',   // Style for line connections
  };

  return (
    // Tailwind classes applied:
    // h-screen: Sets height to 100vh
    // w-screen: Sets width to 100vw
    // absolute and top-0 left-0: Ensures the map covers the entire viewport
    <MapContainer 
      center={cdoPosition} 
      zoom={initialZoom} 
      scrollWheelZoom={true} 
      className="h-screen w-screen absolute top-0 left-0 z-0" 
    >
      
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Polyline 
        positions={routes} 
        pathOptions={polylineOptions} 
      />
      <LocationMarker routeName={routeName}/>
    </MapContainer>
  );
};

export default MapComponent;