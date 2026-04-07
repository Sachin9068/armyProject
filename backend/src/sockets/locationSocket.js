const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../Moduls/User');
const Location = require('../Moduls/Location');

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

function removeSubscriber(ws, targetUserId) {
  const tid = String(targetUserId || '');
  if (!tid) return;

  const set = subscribers.get(tid);
  if (!set) return;

  set.delete(ws);

  if (set.size === 0) {
    subscribers.delete(tid);
  }

  if (ws.subscribedTo) {
    ws.subscribedTo.delete(tid);
  }
}

function removeAllSubscriptions(ws) {
  if (!ws.subscribedTo) return;

  for (const tid of ws.subscribedTo) {
    removeSubscriber(ws, tid);
  }

  ws.subscribedTo.clear();
}

function broadcastToSubscribers(userId, payload) {
  const set = subscribers.get(userId);
  if (!set) return;

  const msg = JSON.stringify(payload);

  for (const client of set) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

/**
 * @param {import('http').Server} server
 */
function attachLocationWebSocket(server) {

  const wss = new WebSocket.Server({
    server,
    path: '/ws/location'
  });

  console.log('✅ Location WebSocket attached');

  wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection', {
      reqUrl: req.url,
      host: req.headers.host,
      origin: req.headers.origin,
    });

    let url;
    try {
      url = new URL(req.url, `http://${req.headers.host}`);
    } catch (err) {
      console.error('WebSocket URL parse failed', err);
      ws.close();
      return;
    }

    const token = url.searchParams.get('token');
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      console.error('WebSocket auth failed', {
        tokenPresent: !!token,
        tokenValue: token ? '[REDACTED]' : null,
        decoded,
      });
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Unauthorized'
      }));
      ws.close();
      return;
    }

    ws.userId = String(decoded.userId);
    ws.role = decoded.role;
    ws.subscribedTo = new Set();

    console.log(`✅ Authenticated ${ws.role} -> ${ws.userId}`);

    ws.on('message', async (raw) => {
      let data;

      try {
        data = JSON.parse(raw.toString());
      } catch {
        return;
      }

      /* ================= ADMIN SUBSCRIBE ================= */
      if (ws.role === 'ADMIN' && data.type === 'subscribe') {
        const tid = String(data.userId || '');
        if (!tid) return;

        let set = subscribers.get(tid);
        if (!set) {
          set = new Set();
          subscribers.set(tid, set);
        }

        set.add(ws);
        ws.subscribedTo.add(tid);

        const last = lastLocations.get(tid);

        ws.send(JSON.stringify({
          type: 'location',
          userId: tid,
          lat: last?.lat || null,
          lng: last?.lng || null,
          updatedAt: last?.updatedAt || null
        }));

        return;
      }

      /* ================= ADMIN UNSUBSCRIBE ================= */
      if (ws.role === 'ADMIN' && data.type === 'unsubscribe') {
        if (data.userId) {
          removeSubscriber(ws, data.userId);
        } else {
          removeAllSubscriptions(ws);
        }
        return;
      }

      /* ================= EMPLOYEE LOCATION ================= */
      if (
        data.type === 'location' &&
        typeof data.lat === 'number' &&
        typeof data.lng === 'number'
      ) {
        //
       if (ws.role !== 'EMPLOYEE') return;

        const uid = ws.userId;
        const now = Date.now();

        console.log(`📍 Location from ${uid}: ${data.lat}, ${data.lng}`);

        const last = lastLocations.get(uid);

        // throttle DB writes to 20 sec
        const shouldPersist =
          !last || (now - last.updatedAt) >= 20000;

        const payload = {
          lat: data.lat,
          lng: data.lng,
          updatedAt: now
        };

        // always update memory
        lastLocations.set(uid, payload);

        /* ---------- ACK BACK TO EMPLOYEE ---------- */
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'location_ack',
            userId: uid,
            ...payload
          }));
        }

        /* ---------- BROADCAST TO ADMINS ---------- */
        broadcastToSubscribers(uid, {
          type: 'location',
          userId: uid,
          ...payload
        });

        // skip DB write if within 20 seconds
        if (!shouldPersist) return;

        try {
          /* update latest in user */
          await User.findByIdAndUpdate(uid, {
            lastLocation: {
              lat: data.lat,
              lng: data.lng,
              updatedAt: new Date()
            }
          });

          /* UPSERT → only one location per user */
          await Location.findOneAndUpdate(
            { userId: uid },
            {
              latitude: data.lat,
              longitude: data.lng,
              timestamp: new Date()
            },
            { upsert: true, new: true }
          );

          console.log(`✅ Persisted location (20s) for ${uid}`);

        } catch (err) {
          console.error('❌ DB error:', err.message);
        }
      }
    });

    ws.on('error', (err) => {
      console.error(`WebSocket client error for ${ws.userId || 'unknown user'}`, err);
    });

    ws.on('close', (code, reason) => {
      console.log(`❌ Disconnected ${ws.userId} (code=${code}, reason=${reason.toString()})`);
      removeAllSubscriptions(ws);
    });
  });
}

module.exports = { attachLocationWebSocket };