// src/services/socket.js
class LocationSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.subscriptions = new Set();
    this.token = null;
    this.reconnectTimer = null;
    this.manualClose = false;
  }

  connect(token, onOpen, onError) {
    this.token = token;
    this.manualClose = false;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (onOpen && this.ws.readyState === WebSocket.OPEN) onOpen();
      return;
    }
    const base =
      import.meta.env.VITE_WS_URL;
    const wsUrl = `${base}/ws/location?token=${token}`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      if (onOpen) onOpen();
      // Resubscribe to previous subscriptions
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.subscriptions.forEach(userId => {
          this.ws.send(JSON.stringify({ type: 'subscribe', userId }));
        });
      }
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handlers = this.listeners.get(data.type);
        if (handlers) {
          handlers.forEach((handler) => handler(data));
        }
      } catch (err) {
        console.error('WebSocket message error', err);
      }
    };
    
    this.ws.onerror = (err) => {
      console.error('WebSocket error', err);
      if (onError) onError(err);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.ws = null;
      if (!this.manualClose && this.token) {
        this.reconnectTimer = setTimeout(() => {
          this.connect(this.token);
        }, 1500);
      }
    };
  }

  sendSubscribe(userId) {
    if (!userId) return;
    this.subscriptions.add(userId);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', userId }));
    }
  }

  sendUnsubscribe(userId) {
    if (userId) {
      this.subscriptions.delete(userId);
    } else {
      this.subscriptions.clear();
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', userId }));
    }
  }

  sendLocation(lat, lng) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'location', lat, lng }));
    }
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
  }

  off(type, callback) {
    if (!this.listeners.has(type)) return;
    if (!callback) {
      this.listeners.delete(type);
      return;
    }
    const set = this.listeners.get(type);
    set.delete(callback);
    if (set.size === 0) this.listeners.delete(type);
  }

  disconnect() {
    this.manualClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }
}

export const locationSocket = new LocationSocket();