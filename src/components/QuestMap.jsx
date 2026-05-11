import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon missing in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically adjust map bounds
function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function QuestMap({ donorLocation, mediatorLocation }) {
  if (!donorLocation || !mediatorLocation) return <div className="h-full w-full bg-surface-container flex items-center justify-center text-on-surface-variant">Acquiring coordinates...</div>;

  const bounds = [
    [mediatorLocation.lat, mediatorLocation.lng],
    [donorLocation.lat, donorLocation.lng]
  ];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        bounds={bounds} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={[mediatorLocation.lat, mediatorLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>
        
        <Marker position={[donorLocation.lat, donorLocation.lng]}>
          <Popup>Pickup Location</Popup>
        </Marker>

        <ChangeView bounds={bounds} />
      </MapContainer>
    </div>
  );
}
