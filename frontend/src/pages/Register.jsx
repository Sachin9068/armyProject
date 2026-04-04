import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
  .tracker-reg-root { min-height:100vh; background:#0a0f0a; display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:2rem 1.5rem 3rem; position:relative; overflow-x:hidden; font-family:'DM Sans',sans-serif; }
  .tracker-grid-bg { position:fixed; inset:0; background-image:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(74,120,74,0.06) 39px,rgba(74,120,74,0.06) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(74,120,74,0.06) 39px,rgba(74,120,74,0.06) 40px); pointer-events:none; z-index:0; }
  .tracker-accent-bar { position:fixed; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#2d5a2d,#5a9e3a,#2d5a2d); z-index:10; }
  .tracker-reg-card { width:100%; max-width:460px; position:relative; z-index:1; margin-top:1rem; }
  .tracker-brand { text-align:center; margin-bottom:1.75rem; }
  .tracker-brand-icon { display:inline-flex; width:52px; height:52px; background:rgba(90,158,58,0.12); border:1.5px solid #5a9e3a; align-items:center; justify-content:center; margin-bottom:0.6rem; clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%); }
  .tracker-brand-name { font-family:'Bebas Neue',sans-serif; font-size:36px; letter-spacing:7px; color:#e8f0e8; line-height:1; margin:0; }
  .tracker-brand-sub { font-size:10px; letter-spacing:3px; color:#5a9e3a; text-transform:uppercase; margin-top:4px; }
  .tracker-section-label { font-size:10px; letter-spacing:2px; color:#5a7e5a; text-transform:uppercase; margin:1.25rem 0 0.6rem; padding-bottom:6px; border-bottom:0.5px solid rgba(90,158,58,0.18); }
  .tracker-form-title { font-size:11px; letter-spacing:2.5px; color:#8ab08a; text-transform:uppercase; margin:0 0 0.5rem; padding-bottom:0.75rem; border-bottom:0.5px solid rgba(90,158,58,0.25); }
  .tracker-field { margin-bottom:1rem; }
  .tracker-field label { display:block; font-size:10px; letter-spacing:1.8px; color:#7a9e7a; text-transform:uppercase; margin-bottom:7px; }
  .tracker-field input,.tracker-field select { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.04); border:0.5px solid rgba(90,158,58,0.3); color:#e8f0e8; font-family:'DM Sans',sans-serif; font-size:14px; padding:11px 14px; outline:none; transition:border-color 0.2s,background 0.2s; border-radius:3px; }
  .tracker-field input::placeholder { color:rgba(138,176,138,0.3); }
  .tracker-field input:focus,.tracker-field select:focus { border-color:#5a9e3a; background:rgba(90,158,58,0.07); }
  .tracker-field select option { background:#111a11; color:#e8f0e8; }
  .tracker-field-hint { font-size:11px; color:#5a7e5a; margin-top:5px; }
  .tracker-field-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .tracker-btn-primary { width:100%; background:#2d5a2d; border:1px solid #5a9e3a; color:#c8e8c8; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; padding:13px; cursor:pointer; transition:background 0.2s,transform 0.1s; border-radius:3px; margin-top:1rem; }
  .tracker-btn-primary:hover:not(:disabled) { background:#3d7a3d; color:#e8f8e8; }
  .tracker-btn-primary:active:not(:disabled) { transform:scale(0.99); }
  .tracker-btn-primary:disabled { opacity:0.45; cursor:not-allowed; }
  .tracker-form-link { text-align:center; margin-top:1.25rem; font-size:13px; color:#5a7a5a; }
  .tracker-form-link a { color:#5a9e3a; text-decoration:none; font-weight:500; }
  .tracker-form-link a:hover { text-decoration:underline; }
  .tracker-error-box { background:rgba(226,75,74,0.1); border:0.5px solid rgba(226,75,74,0.4); border-left:2px solid #e24b4a; color:#f09595; font-size:13px; padding:10px 14px; border-radius:3px; margin-bottom:1rem; }
`;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ role: 'user', armyno: '', rank: '', name: '', departmentTrade: '', mobileno: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="tracker-reg-root">
        <div className="tracker-grid-bg" />
        <div className="tracker-accent-bar" />
        <div className="tracker-reg-card">
          <div className="tracker-brand">
            <div className="tracker-brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5a9e3a" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h1 className="tracker-brand-name">TRACKER</h1>
            <p className="tracker-brand-sub">New Personnel Registration</p>
          </div>

          <p className="tracker-form-title">Create Account</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="tracker-error-box">{error}</div>}

            <p className="tracker-section-label">Identity</p>
            <div className="tracker-field">
              <label>Role</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="user">User</option>
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="tracker-field-row">
              <div className="tracker-field">
                <label>Army Number</label>
                <input type="text" name="armyno" value={formData.armyno} onChange={handleChange} placeholder="e.g. IC-12345" required />
              </div>
              <div className="tracker-field">
                <label>Rank</label>
                <input type="text" name="rank" value={formData.rank} onChange={handleChange} placeholder="e.g. Major" required />
              </div>
            </div>
            <div className="tracker-field">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" required />
            </div>

            <p className="tracker-section-label">Service Details</p>
            <div className="tracker-field">
              <label>Department / Trade</label>
              <input type="text" name="departmentTrade" value={formData.departmentTrade} onChange={handleChange} placeholder="e.g. Infantry, Signals, EME" required />
            </div>
            <div className="tracker-field">
              <label>Mobile Number</label>
              <input type="tel" name="mobileno" value={formData.mobileno} onChange={handleChange} placeholder="10-digit number" required />
              <p className="tracker-field-hint">Username will be auto-generated from name + mobile number</p>
            </div>

            <p className="tracker-section-label">Security</p>
            <div className="tracker-field">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" required />
            </div>
            <div className="tracker-field">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required />
            </div>

            <button type="submit" className="tracker-btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Enlist & Create Account'}
            </button>
          </form>

          <p className="tracker-form-link" style={{ marginBottom: '1.5rem' }}>
            Already enlisted? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;