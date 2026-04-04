const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

/** @type {Map<string, { lat: number, lng: number, updatedAt: number }>} */
const lastLocations = new Map();
/** @type {Map<string, Set<import('ws')>>} */
const subscribers = new Map();

function verifyToken(token) {
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function removeSubscriber(ws) {
  const tid = ws.subscribedTo;
  if (!tid) return;
  const set = subscribers.get(tid);
  if (set) {
    set.delete(ws);
    if (set.size === 0) subscribers.delete(tid);
  }
  ws.subscribedTo = null;
}

function broadcastToSubscribers(userId, payload) {
  const set = subscribers.get(userId);
  if (!set) return;
  const msg = JSON.stringify(payload);
  for (const client of set) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}

/**
 * @param {import('http').Server} server
 */
function attachLocationWebSocket(server) {
  const wss = new WebSocket.Server({ server, path: '/ws/location' });

  wss.on('connection', (ws, req) => {
    let url;
    try {
      url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    } catch {
      ws.close();
      return;
    }

    const token = url.searchParams.get('token');
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      try {
        ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
      } catch { /* ignore */ }
      ws.close();
      return;
    }

    ws.userId = String(decoded.userId);
    ws.role = decoded.role;
    ws.subscribedTo = null;

    ws.on('message', (raw) => {
      let data;
      try {
        data = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (ws.role === 'admin' && data.type === 'subscribe') {
        const tid = data.userId != null ? String(data.userId) : '';
        if (!tid) return;
        removeSubscriber(ws);
        ws.subscribedTo = tid;
        let set = subscribers.get(ws.subscribedTo);
        if (!set) {
          set = new Set();
          subscribers.set(ws.subscribedTo, set);
        }
        set.add(ws);

        const last = lastLocations.get(ws.subscribedTo);
        if (last) {
          ws.send(JSON.stringify({
            type: 'location',
            userId: ws.subscribedTo,
            lat: last.lat,
            lng: last.lng,
            updatedAt: last.updatedAt,
          }));
        } else {
          ws.send(JSON.stringify({
            type: 'location',
            userId: ws.subscribedTo,
            lat: null,
            lng: null,
            updatedAt: null,
          }));
        }
        return;
      }

      if (ws.role === 'admin' && data.type === 'unsubscribe') {
        removeSubscriber(ws);
        return;
      }

      if (data.type === 'location' && typeof data.lat === 'number' && typeof data.lng === 'number') {
        if (ws.role === 'admin') return;
        const uid = ws.userId;
        const payload = { lat: data.lat, lng: data.lng, updatedAt: Date.now() };
        lastLocations.set(uid, payload);
        broadcastToSubscribers(uid, { type: 'location', userId: uid, ...payload });
      }
    });

    ws.on('close', () => {
      removeSubscriber(ws);
    });
  });
}

module.exports = { attachLocationWebSocket };
