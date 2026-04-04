/**
 * WebSocket URL for live location (JWT in query — browser WebSocket cannot set Authorization header).
 */
export function getLocationWebSocketUrl(token) {
  if (!token) return null;
  let origin = import.meta.env.VITE_WS_URL;
  if (!origin) {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    try {
      const u = new URL(api);
      origin = `${u.protocol === 'https:' ? 'wss:' : 'ws:'}//${u.host}`;
    } catch {
      origin = 'ws://localhost:5000';
    }
  }
  const base = origin.replace(/\/$/, '');
  return `${base}/ws/location?token=${encodeURIComponent(token)}`;
}
