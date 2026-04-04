import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import UserLocationMap from '../components/UserLocationMap';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
  *{box-sizing:border-box;}
  .ap-root { min-height:100vh; background:#0a0f0a; display:flex; flex-direction:column; font-family:'DM Sans',sans-serif; overflow-x:hidden; }
  .ap-grid-bg { position:fixed; inset:0; background-image:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(74,120,74,0.06) 39px,rgba(74,120,74,0.06) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(74,120,74,0.06) 39px,rgba(74,120,74,0.06) 40px); pointer-events:none; z-index:0; }
  .ap-accent { height:3px; background:linear-gradient(90deg,#2d5a2d,#5a9e3a,#2d5a2d); z-index:2; position:relative; }
  .ap-nav { background:rgba(8,14,8,0.97); border-bottom:0.5px solid rgba(90,158,58,0.2); padding:0 1.5rem; display:flex; align-items:center; justify-content:space-between; height:58px; z-index:2; position:relative; }
  .ap-nav-brand { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:6px; color:#e8f0e8; text-decoration:none; }
  .ap-nav-brand span { color:#5a9e3a; }
  .ap-nav-right { display:flex; align-items:center; gap:12px; }
  .ap-nav-tag { font-size:10px; letter-spacing:2px; color:#f0c070; text-transform:uppercase; background:rgba(240,192,112,0.1); border:0.5px solid rgba(240,192,112,0.3); padding:5px 12px; border-radius:3px; }
  .ap-btn-back { background:transparent; border:0.5px solid rgba(90,158,58,0.3); color:#8ab08a; font-family:'DM Sans',sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; padding:7px 14px; cursor:pointer; border-radius:3px; text-decoration:none; transition:background 0.2s; }
  .ap-btn-back:hover { background:rgba(90,158,58,0.1); }
  .ap-btn-logout { background:transparent; border:0.5px solid rgba(226,75,74,0.4); color:#f09595; font-family:'DM Sans',sans-serif; font-size:10px; letter-spacing:2px; text-transform:uppercase; padding:7px 14px; cursor:pointer; border-radius:3px; transition:background 0.2s; }
  .ap-btn-logout:hover { background:rgba(226,75,74,0.1); }
  .ap-body { flex:1; padding:1.75rem 1.5rem 3rem; position:relative; z-index:1; max-width:1000px; width:100%; margin:0 auto; }
  .ap-header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:0.5px solid rgba(90,158,58,0.15); flex-wrap:wrap; gap:12px; }
  .ap-header h2 { font-family:'Bebas Neue',sans-serif; font-size:30px; letter-spacing:3px; color:#e8f0e8; margin:0; }
  .ap-header p { font-size:13px; color:#7a9e7a; margin:4px 0 0; }
  .ap-btn-create { background:#2d5a2d; border:1px solid #5a9e3a; color:#c8e8c8; font-family:'DM Sans',sans-serif; font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; padding:10px 20px; cursor:pointer; border-radius:3px; transition:background 0.2s; white-space:nowrap; }
  .ap-btn-create:hover { background:#3d7a3d; }
  .ap-toolbar { display:flex; gap:10px; margin-bottom:1.25rem; flex-wrap:wrap; }
  .ap-search { flex:1; min-width:180px; background:rgba(255,255,255,0.04); border:0.5px solid rgba(90,158,58,0.3); color:#e8f0e8; font-family:'DM Sans',sans-serif; font-size:14px; padding:10px 14px; outline:none; border-radius:3px; transition:border-color 0.2s; }
  .ap-search::placeholder { color:rgba(138,176,138,0.3); }
  .ap-search:focus { border-color:#5a9e3a; background:rgba(90,158,58,0.06); }
  .ap-filter { background:rgba(255,255,255,0.04); border:0.5px solid rgba(90,158,58,0.3); color:#e8f0e8; font-family:'DM Sans',sans-serif; font-size:13px; padding:10px 14px; outline:none; border-radius:3px; cursor:pointer; }
  .ap-filter option { background:#111a11; }
  .ap-stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:1.5rem; }
  @media(max-width:600px){.ap-stats-row{grid-template-columns:1fr 1fr;}}
  .ap-stat { background:rgba(255,255,255,0.025); border:0.5px solid rgba(90,158,58,0.2); border-radius:4px; padding:0.85rem 1rem; }
  .ap-stat-label { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#5a7e5a; margin-bottom:5px; }
  .ap-stat-val { font-family:'Bebas Neue',sans-serif; font-size:24px; letter-spacing:2px; color:#5a9e3a; }
  .ap-table-wrap { background:rgba(255,255,255,0.02); border:0.5px solid rgba(90,158,58,0.18); border-radius:5px; overflow:hidden; }
  .ap-table { width:100%; border-collapse:collapse; }
  .ap-table th { font-size:10px; letter-spacing:1.8px; text-transform:uppercase; color:#5a7e5a; padding:12px 16px; text-align:left; border-bottom:0.5px solid rgba(90,158,58,0.18); background:rgba(0,0,0,0.2); font-weight:500; }
  .ap-table td { font-size:13px; color:#c8e0c8; padding:13px 16px; border-bottom:0.5px solid rgba(90,158,58,0.08); vertical-align:middle; }
  .ap-table tr:last-child td { border-bottom:none; }
  .ap-table tr.ap-row:hover td { background:rgba(90,158,58,0.05); cursor:pointer; }
  .ap-badge { display:inline-block; font-size:10px; letter-spacing:1.2px; text-transform:uppercase; padding:3px 10px; border-radius:2px; font-weight:500; }
  .ap-badge.user { color:#5a9e3a; background:rgba(90,158,58,0.1); border:0.5px solid rgba(90,158,58,0.3); }
  .ap-badge.officer { color:#70b8f0; background:rgba(112,184,240,0.1); border:0.5px solid rgba(112,184,240,0.3); }
  .ap-badge.admin { color:#f0c070; background:rgba(240,192,112,0.1); border:0.5px solid rgba(240,192,112,0.3); }
  .ap-empty { text-align:center; padding:3rem 1rem; color:#5a7e5a; font-size:14px; }
  .ap-loading { text-align:center; padding:3rem; color:#5a7e5a; font-size:13px; letter-spacing:2px; text-transform:uppercase; }
  .ap-error { background:rgba(226,75,74,0.1); border:0.5px solid rgba(226,75,74,0.4); border-left:2px solid #e24b4a; color:#f09595; font-size:13px; padding:12px 16px; border-radius:3px; margin-bottom:1rem; }

  /* MODAL OVERLAY */
  .ap-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:100; display:flex; align-items:center; justify-content:center; padding:1rem; }
  .ap-modal { background:#0d160d; border:0.5px solid rgba(90,158,58,0.3); border-radius:6px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; position:relative; }
  .ap-modal-header { padding:1.25rem 1.5rem; border-bottom:0.5px solid rgba(90,158,58,0.18); display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; background:#0d160d; z-index:1; }
  .ap-modal-title { font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:3px; color:#e8f0e8; margin:0; }
  .ap-modal-close { background:transparent; border:none; color:#5a7e5a; font-size:20px; cursor:pointer; padding:0; line-height:1; transition:color 0.2s; }
  .ap-modal-close:hover { color:#e8f0e8; }
  .ap-modal-body { padding:1.5rem; }
  .ap-field { margin-bottom:1rem; }
  .ap-field label { display:block; font-size:10px; letter-spacing:1.8px; color:#7a9e7a; text-transform:uppercase; margin-bottom:7px; }
  .ap-field input, .ap-field select { width:100%; background:rgba(255,255,255,0.04); border:0.5px solid rgba(90,158,58,0.3); color:#e8f0e8; font-family:'DM Sans',sans-serif; font-size:14px; padding:11px 14px; outline:none; border-radius:3px; transition:border-color 0.2s; }
  .ap-field input::placeholder { color:rgba(138,176,138,0.3); }
  .ap-field input:focus,.ap-field select:focus { border-color:#5a9e3a; background:rgba(90,158,58,0.07); }
  .ap-field select option { background:#111a11; color:#e8f0e8; }
  .ap-field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .ap-field-hint { font-size:11px; color:#5a7e5a; margin-top:5px; }
  .ap-modal-footer { padding:1rem 1.5rem 1.5rem; display:flex; gap:10px; }
  .ap-btn-submit { flex:1; background:#2d5a2d; border:1px solid #5a9e3a; color:#c8e8c8; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; letter-spacing:2px; text-transform:uppercase; padding:12px; cursor:pointer; border-radius:3px; transition:background 0.2s; }
  .ap-btn-submit:hover:not(:disabled) { background:#3d7a3d; }
  .ap-btn-submit:disabled { opacity:0.45; cursor:not-allowed; }
  .ap-btn-cancel { background:transparent; border:0.5px solid rgba(255,255,255,0.1); color:#6a8a6a; font-family:'DM Sans',sans-serif; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; padding:12px 20px; cursor:pointer; border-radius:3px; transition:background 0.2s; }
  .ap-btn-cancel:hover { background:rgba(255,255,255,0.05); }
  .ap-section-sep { font-size:10px; letter-spacing:2px; color:#5a7e5a; text-transform:uppercase; margin:1.25rem 0 0.6rem; padding-bottom:6px; border-bottom:0.5px solid rgba(90,158,58,0.15); }

  /* DETAIL MODAL */
  .ap-detail-header { display:flex; align-items:center; gap:16px; margin-bottom:1.5rem; }
  .ap-detail-avatar { width:60px; height:60px; flex-shrink:0; background:rgba(90,158,58,0.12); border:1.5px solid #5a9e3a; border-radius:4px; display:flex; align-items:center; justify-content:center; font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:2px; color:#5a9e3a; }
  .ap-detail-name { font-family:'Bebas Neue',sans-serif; font-size:26px; letter-spacing:2px; color:#e8f0e8; margin:0 0 6px; }
  .ap-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px 20px; }
  @media(max-width:400px){.ap-detail-grid{grid-template-columns:1fr;}}
  .ap-detail-key { font-size:10px; letter-spacing:1.5px; text-transform:uppercase; color:#5a7e5a; margin-bottom:4px; font-weight:500; }
  .ap-detail-val { font-size:14px; color:#c8e0c8; font-weight:500; }
  .ap-detail-sep { border:none; border-top:0.5px solid rgba(90,158,58,0.15); margin:1.25rem 0; }
  .ap-btn-delete { background:transparent; border:0.5px solid rgba(226,75,74,0.4); color:#f09595; font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; padding:10px 18px; cursor:pointer; border-radius:3px; transition:background 0.2s; }
  .ap-btn-delete:hover { background:rgba(226,75,74,0.12); }
  .ap-btn-location { background:rgba(90,158,58,0.12); border:0.5px solid rgba(90,158,58,0.45); color:#8ad868; font-family:'DM Sans',sans-serif; font-size:11px; letter-spacing:1.5px; text-transform:uppercase; padding:10px 18px; cursor:pointer; border-radius:3px; transition:background 0.2s; }
  .ap-btn-location:hover { background:rgba(90,158,58,0.22); }
  .ap-detail-actions { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
`;

const EMPTY_FORM = { role: 'user', armyno: '', rank: '', name: '', departmentTrade: '', mobileno: '', password: '' };

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [locationUser, setLocationUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      const res = await api.get(`/auth/admin/users?${params}`);
      setUsers(res.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    }
    setLoading(false);
  }, [search, roleFilter]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [user, navigate, fetchUsers]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleCreateChange = (e) => setCreateForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (createForm.password.length < 6) { setCreateError('Password must be at least 6 characters'); return; }
    setCreateLoading(true);
    try {
      await api.post('/auth/admin/users', createForm);
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      fetchUsers();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create user');
    }
    setCreateLoading(false);
  };

  const handleDelete = async (uid) => {
    if (!window.confirm('Are you sure you want to delete this personnel record?')) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/auth/admin/users/${uid}`);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
    setDeleteLoading(false);
  };

  const counts = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    officer: users.filter(u => u.role === 'officer').length,
    user: users.filter(u => u.role === 'user').length,
  };

  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'NA';

  if (!user || user.role !== 'admin') return null;

  return (
    <>
      <style>{styles}</style>
      <div className="ap-root">
        <div className="ap-grid-bg" />
        <div className="ap-accent" />

        <nav className="ap-nav">
          <Link to="/dashboard" className="ap-nav-brand">TRACK<span>ER</span></Link>
          <div className="ap-nav-right">
            <span className="ap-nav-tag">Admin Panel</span>
            <Link to="/dashboard" className="ap-btn-back">Dashboard</Link>
            <button className="ap-btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </nav>

        <div className="ap-body">
          <div className="ap-header">
            <div>
              <h2>PERSONNEL MANAGEMENT</h2>
              <p>Admin view — all registered personnel</p>
            </div>
            <button className="ap-btn-create" onClick={() => { setShowCreate(true); setCreateError(''); setCreateForm(EMPTY_FORM); }}>
              + Enlist New Personnel
            </button>
          </div>

          {/* Stats Row */}
          <div className="ap-stats-row">
            <div className="ap-stat"><div className="ap-stat-label">Total</div><div className="ap-stat-val">{counts.total}</div></div>
            <div className="ap-stat"><div className="ap-stat-label">Users</div><div className="ap-stat-val">{counts.user}</div></div>
            <div className="ap-stat"><div className="ap-stat-label">Officers</div><div className="ap-stat-val">{counts.officer}</div></div>
            <div className="ap-stat"><div className="ap-stat-label">Admins</div><div className="ap-stat-val">{counts.admin}</div></div>
          </div>

          {/* Toolbar */}
          <div className="ap-toolbar">
            <input
              className="ap-search"
              placeholder="Search by name, army no, username, mobile..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select className="ap-filter" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="officer">Officer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <div className="ap-error">{error}</div>}

          {/* Table */}
          <div className="ap-table-wrap">
            {loading ? (
              <div className="ap-loading">Loading personnel data...</div>
            ) : users.length === 0 ? (
              <div className="ap-empty">No personnel records found.</div>
            ) : (
              <table className="ap-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Army No.</th>
                    <th>Rank</th>
                    <th>Department / Trade</th>
                    <th>Mobile</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="ap-row" onClick={() => setSelectedUser(u)}>
                      <td style={{ fontWeight: 500, color: '#e8f0e8' }}>{u.name}</td>
                      <td style={{ fontFamily: 'monospace', color: '#8ab08a' }}>{u.armyno}</td>
                      <td>{u.rank}</td>
                      <td>{u.departmentTrade}</td>
                      <td>{u.mobileno}</td>
                      <td><span className={`ap-badge ${u.role}`}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* CREATE USER MODAL */}
        {showCreate && (
          <div className="ap-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
            <div className="ap-modal">
              <div className="ap-modal-header">
                <h3 className="ap-modal-title">ENLIST PERSONNEL</h3>
                <button className="ap-modal-close" onClick={() => setShowCreate(false)}>✕</button>
              </div>
              <form onSubmit={handleCreateSubmit}>
                <div className="ap-modal-body">
                  {createError && <div className="ap-error" style={{ marginBottom: '1rem' }}>{createError}</div>}

                  <p className="ap-section-sep">Identity</p>
                  <div className="ap-field">
                    <label>Role</label>
                    <select name="role" value={createForm.role} onChange={handleCreateChange} required>
                      <option value="user">User</option>
                      <option value="officer">Officer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="ap-field-row">
                    <div className="ap-field">
                      <label>Army Number</label>
                      <input name="armyno" value={createForm.armyno} onChange={handleCreateChange} placeholder="e.g. IC-12345" required />
                    </div>
                    <div className="ap-field">
                      <label>Rank</label>
                      <input name="rank" value={createForm.rank} onChange={handleCreateChange} placeholder="e.g. Major" required />
                    </div>
                  </div>
                  <div className="ap-field">
                    <label>Full Name</label>
                    <input name="name" value={createForm.name} onChange={handleCreateChange} placeholder="Enter full name" required />
                  </div>

                  <p className="ap-section-sep">Service Details</p>
                  <div className="ap-field">
                    <label>Department / Trade</label>
                    <input name="departmentTrade" value={createForm.departmentTrade} onChange={handleCreateChange} placeholder="e.g. Infantry, Signals" required />
                  </div>
                  <div className="ap-field">
                    <label>Mobile Number</label>
                    <input type="tel" name="mobileno" value={createForm.mobileno} onChange={handleCreateChange} placeholder="10-digit number" required />
                    <p className="ap-field-hint">Username auto-generated from name + mobile</p>
                  </div>

                  <p className="ap-section-sep">Security</p>
                  <div className="ap-field">
                    <label>Password</label>
                    <input type="password" name="password" value={createForm.password} onChange={handleCreateChange} placeholder="Min 6 characters" required />
                  </div>
                </div>
                <div className="ap-modal-footer">
                  <button type="button" className="ap-btn-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="ap-btn-submit" disabled={createLoading}>
                    {createLoading ? 'Creating...' : 'Create Personnel'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* USER DETAIL MODAL */}
        {selectedUser && (
          <div className="ap-overlay" onClick={e => e.target === e.currentTarget && setSelectedUser(null)}>
            <div className="ap-modal">
              <div className="ap-modal-header">
                <h3 className="ap-modal-title">PERSONNEL DETAIL</h3>
                <button className="ap-modal-close" onClick={() => setSelectedUser(null)}>✕</button>
              </div>
              <div className="ap-modal-body">
                <div className="ap-detail-header">
                  <div className="ap-detail-avatar">{getInitials(selectedUser.name)}</div>
                  <div>
                    <div className="ap-detail-name">{selectedUser.name?.toUpperCase()}</div>
                    <span className={`ap-badge ${selectedUser.role}`}>{selectedUser.role?.toUpperCase()}</span>
                  </div>
                </div>
                <hr className="ap-detail-sep" />
                <div className="ap-detail-grid">
                  <div><div className="ap-detail-key">Army Number</div><div className="ap-detail-val">{selectedUser.armyno || '—'}</div></div>
                  <div><div className="ap-detail-key">Rank</div><div className="ap-detail-val">{selectedUser.rank || '—'}</div></div>
                  <div><div className="ap-detail-key">Department / Trade</div><div className="ap-detail-val">{selectedUser.departmentTrade || '—'}</div></div>
                  <div><div className="ap-detail-key">Mobile Number</div><div className="ap-detail-val">{selectedUser.mobileno || '—'}</div></div>
                  <div><div className="ap-detail-key">Username</div><div className="ap-detail-val">{selectedUser.username || '—'}</div></div>
                  <div><div className="ap-detail-key">Role</div><div className="ap-detail-val" style={{ textTransform: 'capitalize' }}>{selectedUser.role || '—'}</div></div>
                  {selectedUser.createdAt && (
                    <div style={{ gridColumn: '1/-1' }}>
                      <div className="ap-detail-key">Enlisted On</div>
                      <div className="ap-detail-val">{new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    </div>
                  )}
                </div>
                <hr className="ap-detail-sep" />
                <div className="ap-detail-actions">
                  <button
                    type="button"
                    className="ap-btn-location"
                    onClick={() => setLocationUser({ id: selectedUser._id, name: selectedUser.name })}
                  >
                    See location
                  </button>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {selectedUser._id !== user?.id && (
                      <button
                        type="button"
                        className="ap-btn-delete"
                        disabled={deleteLoading}
                        onClick={() => handleDelete(selectedUser._id)}
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete Personnel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {locationUser && (
          <UserLocationMap
            userId={locationUser.id}
            displayName={locationUser.name}
            onClose={() => setLocationUser(null)}
          />
        )}
      </div>
    </>
  );
};

export default AdminPanel;