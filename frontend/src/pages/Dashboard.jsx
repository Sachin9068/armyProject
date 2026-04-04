import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LiveLocationSender from '../components/LiveLocationSender';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
  .tracker-dash-root { min-height:100vh; background:#0a0f0a; display:flex; flex-direction:column; position:relative; font-family:'DM Sans',sans-serif; overflow-x:hidden; }
  .tracker-grid-bg { position:fixed; inset:0; background-image:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(74,120,74,0.06) 39px,rgba(74,120,74,0.06) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(74,120,74,0.06) 39px,rgba(74,120,74,0.06) 40px); pointer-events:none; z-index:0; }
  .tracker-accent-bar { height:3px; background:linear-gradient(90deg,#2d5a2d,#5a9e3a,#2d5a2d); position:relative; z-index:2; }
  .tracker-nav { background:rgba(8,14,8,0.97); border-bottom:0.5px solid rgba(90,158,58,0.2); padding:0 1.5rem; display:flex; align-items:center; justify-content:space-between; height:58px; position:relative; z-index:2; }
  .tracker-nav-brand { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:6px; color:#e8f0e8; text-decoration:none; }
  .tracker-nav-brand span { color:#5a9e3a; }
  .tracker-nav-right { display:flex; align-items:center; gap:12px; }
  .tracker-nav-user { font-size:11px; letter-spacing:1.5px; color:#8ab08a; text-transform:uppercase; font-weight:500; }
  .tracker-nav-admin-btn { background:rgba(90,158,58,0.12); border:0.5px solid rgba(90,158,58,0.4); color:#5a9e3a; font-family:'DM Sans',sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; padding:7px 14px; cursor:pointer; border-radius:3px; text-decoration:none; transition:background 0.2s; }
  .tracker-nav-admin-btn:hover { background:rgba(90,158,58,0.22); }
  .tracker-btn-logout { background:transparent; border:0.5px solid rgba(226,75,74,0.4); color:#f09595; font-family:'DM Sans',sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; padding:7px 16px; cursor:pointer; border-radius:3px; transition:background 0.2s; }
  .tracker-btn-logout:hover { background:rgba(226,75,74,0.1); }
  .tracker-dash-body { flex:1; padding:1.75rem 1.5rem 3rem; position:relative; z-index:1; max-width:860px; width:100%; margin:0 auto; box-sizing:border-box; }
  .tracker-page-header { margin-bottom:1.75rem; padding-bottom:1rem; border-bottom:0.5px solid rgba(90,158,58,0.15); }
  .tracker-page-header h2 { font-family:'Bebas Neue',sans-serif; font-size:30px; letter-spacing:3px; color:#e8f0e8; margin:0 0 4px; }
  .tracker-page-header p { font-size:13px; color:#7a9e7a; margin:0; }
  .tracker-admin-banner { background:rgba(240,192,112,0.07); border:0.5px solid rgba(240,192,112,0.25); border-left:2.5px solid #f0c070; padding:12px 16px; border-radius:3px; font-size:13px; color:#d4a84a; line-height:1.6; margin-bottom:1.25rem; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
  .tracker-admin-banner a { color:#f0c070; font-weight:600; text-decoration:none; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; border:0.5px solid rgba(240,192,112,0.4); padding:5px 12px; border-radius:3px; white-space:nowrap; transition:background 0.2s; }
  .tracker-admin-banner a:hover { background:rgba(240,192,112,0.1); }
  .tracker-stat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:1.5rem; }
  @media(max-width:500px){.tracker-stat-grid{grid-template-columns:1fr 1fr;}}
  .tracker-stat-card { background:rgba(255,255,255,0.025); border:0.5px solid rgba(90,158,58,0.2); border-radius:4px; padding:1rem; }
  .tracker-stat-label { font-size:10px; letter-spacing:1.8px; text-transform:uppercase; color:#5a7e5a; margin-bottom:7px; font-weight:500; }
  .tracker-stat-value { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:2px; color:#5a9e3a; line-height:1; }
  .tracker-stat-sub { font-size:11px; color:#5a7e5a; margin-top:3px; }
  .tracker-section-heading { font-size:11px; letter-spacing:2px; color:#8ab08a; text-transform:uppercase; margin:0 0 0.75rem; font-weight:500; }
  .tracker-profile-card { background:rgba(255,255,255,0.025); border:0.5px solid rgba(90,158,58,0.2); border-radius:5px; padding:1.5rem; margin-bottom:1rem; }
  .tracker-profile-header { display:flex; align-items:center; gap:16px; margin-bottom:1.25rem; padding-bottom:1.25rem; border-bottom:0.5px solid rgba(90,158,58,0.15); }
  .tracker-avatar { width:54px; height:54px; flex-shrink:0; background:rgba(90,158,58,0.12); border:1.5px solid #5a9e3a; border-radius:4px; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:2px; color:#5a9e3a; }
  .tracker-profile-name { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:2px; color:#e8f0e8; line-height:1.1; margin:0 0 6px; }
  .tracker-role-badge { display:inline-block; font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#5a9e3a; background:rgba(90,158,58,0.1); border:0.5px solid rgba(90,158,58,0.3); padding:4px 12px; border-radius:2px; font-weight:500; }
  .tracker-role-badge.admin { color:#f0c070; background:rgba(240,192,112,0.1); border-color:rgba(240,192,112,0.3); }
  .tracker-role-badge.officer { color:#70b8f0; background:rgba(112,184,240,0.1); border-color:rgba(112,184,240,0.3); }
  .tracker-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px 20px; }
  @media(max-width:460px){.tracker-detail-grid{grid-template-columns:1fr;}}
  .tracker-detail-key { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#5a7e5a; margin-bottom:4px; font-weight:500; }
  .tracker-detail-val { font-size:14px; color:#c8e0c8; font-weight:500; }
  .tracker-info-banner { background:rgba(90,158,58,0.07); border:0.5px solid rgba(90,158,58,0.2); border-left:2.5px solid #5a9e3a; padding:12px 16px; border-radius:3px; font-size:13px; color:#8ab08a; line-height:1.6; }
`;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sessionTime, setSessionTime] = useState('00:00');

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const secs = Math.floor((Date.now() - start) / 1000);
      const m = String(Math.floor(secs / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      setSessionTime(`${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return null;

  const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'NA';
  const firstName = user.name ? user.name.split(' ')[0].toUpperCase() : 'SOLDIER';
  const roleLabels = { user: 'L1', officer: 'L2', admin: 'L3' };
  const roleDesc = { user: 'Standard access', officer: 'Officer access', admin: 'Full access' };

  return (
    <>
      <style>{styles}</style>
      <div className="tracker-dash-root">
        <div className="tracker-grid-bg" />
        <div className="tracker-accent-bar" />
        <nav className="tracker-nav">
          <Link to="/dashboard" className="tracker-nav-brand">TRACK<span>ER</span></Link>
          <div className="tracker-nav-right">
            <span className="tracker-nav-user">{user.rank ? `${user.rank.toUpperCase()} ` : ''}{firstName}</span>
            {user.role === 'admin' && <Link to="/admin" className="tracker-nav-admin-btn">Admin Panel</Link>}
            <button className="tracker-btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="tracker-dash-body">
          <div className="tracker-page-header">
            <h2>WELCOME, {firstName}</h2>
            <p>{user.rank && `${user.rank} · `}{user.departmentTrade && `${user.departmentTrade} · `}Personnel portal active</p>
          </div>

          {user.role === 'admin' && (
            <div className="tracker-admin-banner">
              <span>You have admin privileges — manage all personnel from the Admin Panel.</span>
              <Link to="/admin">Open Admin Panel</Link>
            </div>
          )}

          <div className="tracker-stat-grid">
            <div className="tracker-stat-card">
              <div className="tracker-stat-label">Status</div>
              <div className="tracker-stat-value" style={{ fontSize: '18px' }}>ACTIVE</div>
              <div className="tracker-stat-sub">On duty</div>
            </div>
            <div className="tracker-stat-card">
              <div className="tracker-stat-label">Clearance</div>
              <div className="tracker-stat-value">{roleLabels[user.role] || 'L1'}</div>
              <div className="tracker-stat-sub">{roleDesc[user.role] || 'Standard access'}</div>
            </div>
            <div className="tracker-stat-card">
              <div className="tracker-stat-label">Session</div>
              <div className="tracker-stat-value" style={{ fontSize: '22px' }}>{sessionTime}</div>
              <div className="tracker-stat-sub">Time active</div>
            </div>
          </div>

          <p className="tracker-section-heading">Personnel Record</p>
          <div className="tracker-profile-card">
            <div className="tracker-profile-header">
              <div className="tracker-avatar">{initials}</div>
              <div>
                <div className="tracker-profile-name">{user.name?.toUpperCase()}</div>
                <span className={`tracker-role-badge ${user.role}`}>{user.role?.toUpperCase()}</span>
              </div>
            </div>
            <div className="tracker-detail-grid">
              <div><div className="tracker-detail-key">Army Number</div><div className="tracker-detail-val">{user.armyno || '—'}</div></div>
              <div><div className="tracker-detail-key">Rank</div><div className="tracker-detail-val">{user.rank || '—'}</div></div>
              <div><div className="tracker-detail-key">Department / Trade</div><div className="tracker-detail-val">{user.departmentTrade || '—'}</div></div>
              <div><div className="tracker-detail-key">Mobile Number</div><div className="tracker-detail-val">{user.mobileno || '—'}</div></div>
              <div><div className="tracker-detail-key">Username</div><div className="tracker-detail-val">{user.username || '—'}</div></div>
              <div><div className="tracker-detail-key">Role</div><div className="tracker-detail-val" style={{ textTransform: 'capitalize' }}>{user.role || '—'}</div></div>
            </div>
          </div>

          <div className="tracker-info-banner">
            Your username was automatically generated from your name and mobile number. You can sign in using either your username or mobile number.
          </div>

          <LiveLocationSender user={user} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;