// src/services/socket.js
class LocationSocket {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.subscriptions = new Set();
  }

  connect(token, onOpen, onError) {
    const base =
      import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    const wsUrl = `${base}/ws/location?token=${token}`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      if (onOpen) onOpen();
      // Resubscribe to previous subscriptions
      this.subscriptions.forEach(userId => {
        this.sendSubscribe(userId);
      });
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handler = this.listeners.get(data.type);
        if (handler) handler(data);
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
    };
  }

  sendSubscribe(userId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', userId }));
      this.subscriptions.add(userId);
    }
  }

  sendUnsubscribe(userId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', userId }));
      this.subscriptions.delete(userId);
    }
  }

  sendLocation(lat, lng) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'location', lat, lng }));
    }
  }

  on(type, callback) {
    this.listeners.set(type, callback);
  }

  off(type) {
    this.listeners.delete(type);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }
}

export const locationSocket = new LocationSocket();