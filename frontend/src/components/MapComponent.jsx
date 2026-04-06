// src/components/MapComponent.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapComponent = ({ markers, center = [20.5937, 78.9629], zoom = 5 }) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView(center, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(mapRef.current);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    markers.forEach(marker => {
      if (marker.lat && marker.lng) {
        const popupContent = `
          <b>${marker.name}</b><br/>
          Army No: ${marker.armyno}<br/>
          Last updated: ${marker.updatedAt ? new Date(marker.updatedAt).toLocaleString() : 'N/A'}
        `;
        const m = L.marker([marker.lat, marker.lng]).addTo(mapRef.current);
        m.bindPopup(popupContent);
        markersRef.current[marker.id] = m;
      }
    });
  }, [markers]);

  return <div id="map" style={{ height: '500px', width: '100%', borderRadius: '8px' }} />;
};

export default MapComponent;