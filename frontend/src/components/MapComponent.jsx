// src/components/MapComponent.jsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

const getTrackerIcon = (isLive) =>
  L.divIcon({
    className: `tracker-marker ${isLive ? 'is-live' : 'is-stale'}`,
    html: '<span class="tracker-dot"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

const MapComponent = ({
  markers,
  center = [20.5937, 78.9629],
  zoom = 5,
  followLatest = false,
  followZoom = 14,
}) => {
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markersRef = useRef({});
  const animationsRef = useRef({});

  const animateMarkerTo = (leafletMarker, toLat, toLng, duration = 1000) => {
    const from = leafletMarker.getLatLng();
    const start = performance.now();
    const markerAnimKey = leafletMarker._leaflet_id;
    const prevRafId = animationsRef.current[markerAnimKey];
    if (prevRafId) cancelAnimationFrame(prevRafId);

    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // easeInOut cubic for smooth movement
      const eased = t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
      const lat = from.lat + (toLat - from.lat) * eased;
      const lng = from.lng + (toLng - from.lng) * eased;
      leafletMarker.setLatLng([lat, lng]);
      if (t < 1) {
        animationsRef.current[markerAnimKey] = requestAnimationFrame(step);
      }
    };
    animationsRef.current[markerAnimKey] = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map(mapElRef.current).setView(center, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      }).addTo(mapRef.current);
    }
    return () => {
      Object.values(animationsRef.current).forEach((rafId) => cancelAnimationFrame(rafId));
      animationsRef.current = {};
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, zoom, { animate: true });
  }, [center?.[0], center?.[1], zoom]);

  useEffect(() => {
    if (!mapRef.current) return;

    const nextIds = new Set();

    // Add or update markers with smooth transition
    markers.forEach((marker) => {
      if (typeof marker.lat !== 'number' || typeof marker.lng !== 'number') return;
      nextIds.add(marker.id);

      const popupContent = `
        <b>${marker.name}</b><br/>
        Army No: ${marker.armyno}<br/>
        Last updated: ${marker.updatedAt ? new Date(marker.updatedAt).toLocaleString() : 'N/A'}
      `;
      const isLive = !!marker.isLive;

      if (!markersRef.current[marker.id]) {
        const m = L.marker([marker.lat, marker.lng], { icon: getTrackerIcon(isLive) }).addTo(mapRef.current);
        m.bindPopup(popupContent);
        markersRef.current[marker.id] = m;
      } else {
        const existing = markersRef.current[marker.id];
        existing.setPopupContent(popupContent);
        existing.setIcon(getTrackerIcon(isLive));
        animateMarkerTo(existing, marker.lat, marker.lng);
      }
    });

    // Remove stale markers
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!nextIds.has(id)) {
        marker.remove();
        delete markersRef.current[id];
      }
    });

    // Follow latest point smoothly (used by history page)
    if (followLatest && markers.length > 0) {
      const latest = markers[0];
      if (typeof latest.lat === 'number' && typeof latest.lng === 'number') {
        mapRef.current.flyTo([latest.lat, latest.lng], followZoom, {
          animate: true,
          duration: 0.8,
        });
      }
    }
  }, [markers, followLatest, followZoom]);

  return <div ref={mapElRef} style={{ height: '500px', width: '100%', borderRadius: '8px' }} />;
};

export default MapComponent;