import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Amenity } from '../services/location.ts';

const markerIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
});

const centerMarkerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="8" fill="#ff4444" stroke="#ffffff" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="#ffffff"/>
    </svg>
  `),
  iconSize: [32, 32], 
  iconAnchor: [16, 16], 
  popupAnchor: [0, -16]
});

interface Props { 
  center: {
    lat: number;
    lon: number;
  }; 
  amenities: Amenity[];
  displayName?: string;
}

export default function MapView({ center, amenities, displayName }: Readonly<Props>) {
  const position: LatLngTuple = [center.lat, center.lon];
  
  return (
    <div className="map-wrapper" style={{ position: 'absolute', inset: 0 }}>
      <MapContainer 
        center={position} 
        zoom={16} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
        
        {/* Center marker for the searched address */}
        <Marker position={position} icon={centerMarkerIcon}>
          <Popup>
            <strong>Searched Location</strong><br />
            {displayName || 'Your selected address'}
          </Popup>
        </Marker>
        
        {/* Amenity markers */}
        {amenities.map(a => (
          <Marker key={a.id} position={[a.lat, a.lon]} icon={markerIcon}>
            <Popup>
              <strong>{a.name || a.type}</strong><br />{a.distance.toFixed(0)} m
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}