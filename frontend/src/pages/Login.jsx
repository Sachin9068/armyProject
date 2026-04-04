import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
  .tracker-login-root { min-height:100vh; background:#0a0f0a; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem 1.5rem; position:relative; overflow:hidden; font-family:'DM Sans',sans-serif; }
  .tracker-grid-bg { position:absolute; inset:0; background-image:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(74,120,74,0.06) 39px,rgba(74,120,74,0.06) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(74,120,74,0.06) 39px,rgba(74,120,74,0.06) 40px); pointer-events:none; }
  .tracker-accent-bar { position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#2d5a2d,#5a9e3a,#2d5a2d); }
  .tracker-login-card { width:100%; max-width:400px; position:relative; z-index:1; }
  .tracker-brand { text-align:center; margin-bottom:2rem; }
  .tracker-brand-icon { display:inline-flex; width:58px; height:58px; background:rgba(90,158,58,0.12); border:1.5px solid #5a9e3a; align-items:center; justify-content:center; margin-bottom:0.75rem; clip-path:polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%); }
  .tracker-brand-name { font-family:'Bebas Neue',sans-serif; font-size:42px; letter-spacing:8px; color:#e8f0e8; line-height:1; margin:0; }
  .tracker-brand-sub { font-size:11px; letter-spacing:3px; color:#5a9e3a; text-transform:uppercase; margin-top:5px; }
  .tracker-form-section-title { font-size:11px; letter-spacing:2.5px; color:#8ab08a; text-transform:uppercase; margin:0 0 1.25rem; padding-bottom:0.75rem; border-bottom:0.5px solid rgba(90,158,58,0.25); }
  .tracker-field { margin-bottom:1.1rem; }
  .tracker-field label { display:block; font-size:10px; letter-spacing:1.8px; color:#7a9e7a; text-transform:uppercase; margin-bottom:7px; }
  .tracker-field input { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.04); border:0.5px solid rgba(90,158,58,0.3); color:#e8f0e8; font-family:'DM Sans',sans-serif; font-size:14px; padding:11px 14px; outline:none; transition:border-color 0.2s,background 0.2s; border-radius:3px; }
  .tracker-field input::placeholder { color:rgba(138,176,138,0.3); }
  .tracker-field input:focus { border-color:#5a9e3a; background:rgba(90,158,58,0.07); }
  .tracker-btn-primary { width:100%; background:#2d5a2d; border:1px solid #5a9e3a; color:#c8e8c8; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; letter-spacing:2.5px; text-transform:uppercase; padding:13px; cursor:pointer; transition:background 0.2s,transform 0.1s; border-radius:3px; margin-top:0.5rem; }
  .tracker-btn-primary:hover:not(:disabled) { background:#3d7a3d; color:#e8f8e8; }
  .tracker-btn-primary:active:not(:disabled) { transform:scale(0.99); }
  .tracker-btn-primary:disabled { opacity:0.45; cursor:not-allowed; }
  .tracker-form-link { text-align:center; margin-top:1.25rem; font-size:13px; color:#5a7a5a; }
  .tracker-form-link a { color:#5a9e3a; text-decoration:none; font-weight:500; }
  .tracker-form-link a:hover { text-decoration:underline; }
  .tracker-error-box { background:rgba(226,75,74,0.1); border:0.5px solid rgba(226,75,74,0.4); border-left:2px solid #e24b4a; color:#f09595; font-size:13px; padding:10px 14px; border-radius:3px; margin-bottom:1rem; }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData.identifier, formData.password);
    if (result.success) {
      // Redirect admin to admin panel, others to dashboard
      navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="tracker-login-root">
        <div className="tracker-grid-bg" />
        <div className="tracker-accent-bar" />
        <div className="tracker-login-card">
          <div className="tracker-brand">
            <div className="tracker-brand-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5a9e3a" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h1 className="tracker-brand-name">TRACKER</h1>
            <p className="tracker-brand-sub">Army Personnel System</p>
          </div>

          <p className="tracker-form-section-title">Secure Sign In</p>

          <form onSubmit={handleSubmit}>
            {error && <div className="tracker-error-box">{error}</div>}
            <div className="tracker-field">
              <label>Username or Mobile Number</label>
              <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} placeholder="Enter identifier" required />
            </div>
            <div className="tracker-field">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="tracker-btn-primary" disabled={loading}>
              {loading ? 'Authenticating...' : 'Authenticate'}
            </button>
          </form>

          <p className="tracker-form-link">
            No account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;