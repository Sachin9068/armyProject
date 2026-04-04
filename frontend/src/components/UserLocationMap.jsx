import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getLocationWebSocketUrl } from '../utils/wsUrl';

export default function UserLocationMap({ userId, displayName, onClose }) {
  const mapEl = useRef(null);
  const markerRef = useRef(null);
  const [hint, setHint] = useState('Connecting…');

  useEffect(() => {
    const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!mapboxToken) {
      setHint('Add VITE_MAPBOX_TOKEN to your frontend .env file.');
      return undefined;
    }
    mapboxgl.accessToken = mapboxToken;

    const token = localStorage.getItem('token');
    const wsUrl = getLocationWebSocketUrl(token);
    if (!wsUrl) {
      setHint('Not signed in.');
      return undefined;
    }

    const map = new mapboxgl.Map({
      container: mapEl.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [78.9629, 20.5937],
      zoom: 4,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'subscribe', userId }));
      setHint('Waiting for live location from device…');
    };

    ws.onmessage = (ev) => {
      let data;
      try {
        data = JSON.parse(ev.data);
      } catch {
        return;
      }
      if (data.type === 'error') {
        setHint(data.message || 'Error');
        return;
      }
      if (data.type !== 'location') return;
      if (data.lat == null || data.lng == null) {
        setHint('No position yet. User app should send GPS every 5 seconds.');
        return;
      }
      setHint(
        data.updatedAt
          ? `Updated ${new Date(data.updatedAt).toLocaleTimeString()}`
          : 'Live'
      );
      const lngLat = [data.lng, data.lat];
      if (!markerRef.current) {
        markerRef.current = new mapboxgl.Marker({ color: '#5a9e3a' })
          .setLngLat(lngLat)
          .addTo(map);
        map.flyTo({ center: lngLat, zoom: 14, essential: true });
      } else {
        markerRef.current.setLngLat(lngLat);
      }
    };

    ws.onerror = () => setHint('Connection error.');

    return () => {
      ws.close();
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
    };
  }, [userId]);

  return (
    <div className="ap-overlay" style={{ zIndex: 110 }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ap-modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="ap-modal-header">
          <h3 className="ap-modal-title">LIVE LOCATION — {displayName?.toUpperCase() || 'USER'}</h3>
          <button type="button" className="ap-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="ap-modal-body" style={{ paddingTop: 0 }}>
          <p style={{ fontSize: 12, color: '#7a9e7a', margin: '0 0 10px', letterSpacing: '0.5px' }}>{hint}</p>
          <div
            ref={mapEl}
            style={{
              width: '100%',
              height: 420,
              borderRadius: 4,
              border: '0.5px solid rgba(90,158,58,0.25)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
