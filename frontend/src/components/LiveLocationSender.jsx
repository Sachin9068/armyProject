import { useEffect, useRef, useState } from 'react';
import { getLocationWebSocketUrl } from '../utils/wsUrl';

/**
 * Sends device location to the backend every 5s over WebSocket (user/officer — not admin).
 * Native apps can use the same /ws/location protocol with the user's JWT.
 */
export default function LiveLocationSender({ user }) {
  const [note, setNote] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user || user.role === 'admin') return undefined;

    const token = localStorage.getItem('token');
    const url = getLocationWebSocketUrl(token);
    if (!url) return undefined;

    const ws = new WebSocket(url);

    const sendLocation = () => {
      if (ws.readyState !== WebSocket.OPEN) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          ws.send(JSON.stringify({
            type: 'location',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }));
        },
        () => {
          setNote('Allow location access in your browser to share your position.');
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    };

    ws.onopen = () => {
      setNote('Live location sharing active (updates every 5s).');
      sendLocation();
      intervalRef.current = window.setInterval(sendLocation, 5000);
    };

    ws.onerror = () => setNote('Could not connect for location sharing.');

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      ws.close();
    };
  }, [user?.id, user?.role]);

  if (!user || user.role === 'admin') return null;

  return (
    <div
      className="tracker-loc-banner"
      style={{
        marginTop: '1rem',
        background: 'rgba(90,158,58,0.07)',
        border: '0.5px solid rgba(90,158,58,0.25)',
        borderLeft: '2.5px solid #5a9e3a',
        padding: '12px 16px',
        borderRadius: 3,
        fontSize: 13,
        color: '#8ab08a',
        lineHeight: 1.5,
      }}
    >
      {note || 'Starting location sharing…'}
    </div>
  );
}
