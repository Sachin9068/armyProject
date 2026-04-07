// src/pages/admin/LiveMap.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { locationSocket } from '../../services/socket';
import MapComponent from '../../components/MapComponent';
import { useAuth } from '../../context/AuthContext';

const LIVE_WINDOW_MS = 15000;

const LiveMap = () => {
  const { token }                     = useAuth();
  const [employees, setEmployees]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [activeId, setActiveId]       = useState(null);
  const mapRef                        = useRef(null); // ref passed down to MapComponent

  useEffect(() => {
    if (!token) return undefined;

    const handleLocation = (data) => {
      if (!data?.userId || typeof data.lat !== 'number' || typeof data.lng !== 'number') return;
      setEmployees((prev) => {
        const found = prev.some((emp) => emp._id === data.userId);
        if (found) {
          return prev.map((emp) =>
            emp._id === data.userId
              ? {
                  ...emp,
                  lastLocation: {
                    lat: data.lat,
                    lng: data.lng,
                    updatedAt: new Date(data.updatedAt || Date.now()),
                  },
                }
              : emp
          );
        }
        return [
          ...prev,
          {
            _id: data.userId,
            name: 'Employee',
            armyno: data.userId,
            lastLocation: {
              lat: data.lat,
              lng: data.lng,
              updatedAt: new Date(data.updatedAt || Date.now()),
            },
          },
        ];
      });
    };

    connectWebSocket();
    locationSocket.on('location', handleLocation);
    fetchLiveLocations();
    const refreshTimer = window.setInterval(fetchLiveLocations, 10000);

    return () => {
      window.clearInterval(refreshTimer);
      locationSocket.off('location', handleLocation);
      locationSocket.sendUnsubscribe();
      locationSocket.disconnect();
    };
  }, [token]);

  const fetchLiveLocations = async () => {
    try {
      const res = await api.get('/admin/locations/live');
      const empData = res.data.data || [];
      setEmployees(empData);
      setLastRefresh(new Date());
      empData.forEach((emp) => { if (emp._id) locationSocket.sendSubscribe(emp._id); });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    locationSocket.connect(
      token,
      () => console.log('WebSocket ready for admin'),
      (err) => console.error(err)
    );
  };

  // Build markers — handles both emp.lat/lng and emp.lastLocation.lat/lng
  const mapMarkers = employees
    .map((emp) => {
      const lat = typeof emp.lastLocation?.lat === 'number'
        ? emp.lastLocation.lat
        : typeof emp.lat === 'number' ? emp.lat : null;

      const lng = typeof emp.lastLocation?.lng === 'number'
        ? emp.lastLocation.lng
        : typeof emp.lng === 'number' ? emp.lng : null;

      const updatedAt = emp.lastLocation?.updatedAt || emp.updatedAt || null;

      if (lat === null || lng === null) return null;

      const ts     = updatedAt ? new Date(updatedAt).getTime() : 0;
      const isLive = ts > 0 && Date.now() - ts <= LIVE_WINDOW_MS;

      return {
        id: emp._id,
        name: emp.name || 'Unknown',
        armyno: emp.armyno || emp._id,
        lat, lng, updatedAt, isLive,
      };
    })
    .filter(Boolean);

  const liveCount  = mapMarkers.filter((m) => m.isLive).length;
  const staleCount = mapMarkers.filter((m) => !m.isLive).length;

  // When a card is clicked, pan the map to that employee
  const handleCardClick = (emp) => {
    const lat = typeof emp.lastLocation?.lat === 'number'
      ? emp.lastLocation.lat
      : typeof emp.lat === 'number' ? emp.lat : null;
    const lng = typeof emp.lastLocation?.lng === 'number'
      ? emp.lastLocation.lng
      : typeof emp.lng === 'number' ? emp.lng : null;

    setActiveId(emp._id);

    if (mapRef.current && lat !== null && lng !== null) {
      mapRef.current.flyTo([lat, lng], 14, { animate: true, duration: 0.8 });

      // Open popup for this marker
      setTimeout(() => {
        mapRef.current.eachLayer((layer) => {
          if (layer instanceof window.L?.Marker) {
            const pos = layer.getLatLng();
            if (Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001) {
              layer.openPopup();
            }
          }
        });
      }, 900);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <svg className="animate-spin h-6 w-6 mr-3 text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading live map...
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Live Employee Tracking</h1>
        {lastRefresh && (
          <span className="text-xs text-gray-400">
            Last synced: {lastRefresh.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-4 py-2 shadow-sm">
          <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 0 3px rgba(34,197,94,0.25)' }} />
          <span className="text-sm font-medium text-gray-700">{liveCount} Live</span>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-4 py-2 shadow-sm">
          <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#f97316', boxShadow:'0 0 0 3px rgba(249,115,22,0.25)' }} />
          <span className="text-sm font-medium text-gray-700">{staleCount} Stale</span>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-700">{employees.length} Total</span>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {mapMarkers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm">No employee locations available</p>
            <p className="text-xs mt-1 text-gray-300">Locations will appear once employees share them</p>
          </div>
        ) : (
          <MapComponent
            markers={mapMarkers}
            center={[20.5937, 78.9629]}
            zoom={5}
            mapRef={mapRef}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-xs text-gray-500 px-1">
        <div className="flex items-center gap-2">
          <span style={{ display:'inline-block', width:14, height:14, borderRadius:'50%', background:'#22c55e', border:'2px solid white', boxShadow:'0 0 0 3px rgba(34,197,94,0.3)' }} />
          Live — updated within 15s
        </div>
        <div className="flex items-center gap-2">
          <span style={{ display:'inline-block', width:14, height:14, borderRadius:'50%', background:'#f97316', border:'2px solid white', boxShadow:'0 0 0 3px rgba(249,115,22,0.2)' }} />
          Stale — last known location
        </div>
        <span className="ml-auto italic">Click a card to locate on map</span>
      </div>

      {/* Employee cards — click to pan map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => {
          const lat = typeof emp.lastLocation?.lat === 'number'
            ? emp.lastLocation.lat
            : typeof emp.lat === 'number' ? emp.lat : null;

          const updatedAt = emp.lastLocation?.updatedAt || emp.updatedAt || null;
          const ts        = updatedAt ? new Date(updatedAt).getTime() : 0;
          const isLive    = ts > 0 && Date.now() - ts <= LIVE_WINDOW_MS;
          const hasLoc    = lat !== null;
          const isActive  = activeId === emp._id;

          return (
            <div
              key={emp._id}
              onClick={() => hasLoc && handleCardClick(emp)}
              className={`bg-white rounded-xl shadow-sm border p-4 flex items-start gap-3 transition-all
                ${hasLoc ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
                ${isActive ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'}`}
            >
              {/* Animated status dot matching map marker */}
              <span style={{
                marginTop: 4,
                flexShrink: 0,
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: hasLoc ? (isLive ? '#22c55e' : '#f97316') : '#d1d5db',
                boxShadow: hasLoc
                  ? isLive
                    ? '0 0 0 3px rgba(34,197,94,0.3), 0 0 0 6px rgba(34,197,94,0.1)'
                    : '0 0 0 3px rgba(249,115,22,0.3), 0 0 0 6px rgba(249,115,22,0.1)'
                  : 'none',
              }} />

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-800 truncate">
                  {emp.name}{' '}
                  <span className="font-normal text-gray-400 text-sm">({emp.armyno})</span>
                </p>
                <p className="text-sm text-gray-500 truncate">
                  BHM: {emp.bhmId?.name || 'N/A'}
                </p>
                {hasLoc ? (
                  <p className={`text-xs mt-1 font-medium ${isLive ? 'text-green-600' : 'text-orange-500'}`}>
                    {isLive ? '● Live · ' : '○ Last seen · '}
                    {updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'N/A'}
                  </p>
                ) : (
                  <p className="text-xs mt-1 text-gray-400">No location data</p>
                )}
              </div>

              {/* Locate icon shown only when has location */}
              {hasLoc && (
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default LiveMap;