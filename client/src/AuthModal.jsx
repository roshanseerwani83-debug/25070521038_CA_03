import { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  GraduationCap, 
  Key, 
  Mail, 
  User, 
  Hash, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import API from './api';

const BRANCH_OPTIONS = [
  "Computer Science & Engineering",
  "Computer Science & Engineering (AIML)",
  "Information Technology",
  "Robotics & Automation",
  "Electronics & Telecommunication"
];

const AuthModal = ({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  // Login form
  const [emailOrPrn, setEmailOrPrn] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [name, setName] = useState('');
  const [prn, setPrn] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [branch, setBranch] = useState(BRANCH_OPTIONS[0]);
  const [year, setYear] = useState('3rd Year (Semester 5)');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailOrPrn.trim() || !loginPassword.trim()) {
      setErrorMsg('Please enter both Email/PRN and Password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPrn, password: loginPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Welcome back to SIT Nagpur CampusPulse!');
        localStorage.setItem('campuspulse_user', JSON.stringify(data.user));
        localStorage.setItem('campuspulse_token', data.token);
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 600);
      } else {
        setErrorMsg(data.error || 'Failed to authenticate.');
      }
    } catch (err) {
      setErrorMsg('Could not connect to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Please fill in Name, Email, and Password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          prn,
          email: regEmail,
          password: regPassword,
          branch,
          year
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Account registered successfully for SIT Nagpur!');
        localStorage.setItem('campuspulse_user', JSON.stringify(data.user));
        localStorage.setItem('campuspulse_token', data.token);
        setTimeout(() => {
          onAuthSuccess(data.user);
          onClose();
        }, 700);
      } else {
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg('Server connection failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click Demo Student fill
  const handleDemoLogin = () => {
    setEmailOrPrn('roshan@sitnagpur.siu.edu.in');
    setLoginPassword('password123');
    setErrorMsg('');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-icon" style={{ width: '30px', height: '30px', fontSize: '15px' }}>
              <GraduationCap size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
                {isLogin ? 'Student Sign In' : 'Create SIT Student Account'}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Symbiosis Institute of Technology (SIT), Nagpur
              </span>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            style={{ padding: '4px 8px', borderRadius: '50%' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="view-tabs" style={{ marginBottom: '18px' }}>
          <button 
            type="button" 
            className={`view-tab ${isLogin ? 'active' : ''}`} 
            style={{ flex: 1, textAlign: 'center' }}
            onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <LogIn size={14} /> Sign In
          </button>
          <button 
            type="button" 
            className={`view-tab ${!isLogin ? 'active' : ''}`} 
            style={{ flex: 1, textAlign: 'center' }}
            onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); }}
          >
            <UserPlus size={14} /> Register / Sign Up
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '10px 14px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-md)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {isLogin ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Email or Student PRN</label>
              <input 
                type="text" 
                value={emailOrPrn} 
                onChange={(e) => setEmailOrPrn(e.target.value)} 
                placeholder="roshan@sitnagpur.siu.edu.in or 23070123001" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                placeholder="Enter your password" 
                required 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '4px' }} disabled={loading}>
              <LogIn size={15} /> {loading ? 'Signing In...' : 'Sign In to Workspace'}
            </button>

            {/* Quick Demo button */}
            <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%' }}
                onClick={handleDemoLogin}
              >
                <Sparkles size={14} /> Auto-Fill SIT Demo Student (Roshan)
              </button>
            </div>
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Roshan Sharma" 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">SIT Student PRN</label>
                <input 
                  type="text" 
                  value={prn} 
                  onChange={(e) => setPrn(e.target.value)} 
                  placeholder="e.g. 23070123001" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Email *</label>
                <input 
                  type="email" 
                  value={regEmail} 
                  onChange={(e) => setRegEmail(e.target.value)} 
                  placeholder="student@sitnagpur.siu.edu.in" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Department / Branch</label>
              <select value={branch} onChange={(e) => setBranch(e.target.value)}>
                {BRANCH_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <select value={year} onChange={(e) => setYear(e.target.value)}>
                  <option>1st Year (Semester 1/2)</option>
                  <option>2nd Year (Semester 3/4)</option>
                  <option>3rd Year (Semester 5/6)</option>
                  <option>4th Year (Semester 7/8)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Create Password *</label>
                <input 
                  type="password" 
                  value={regPassword} 
                  onChange={(e) => setRegPassword(e.target.value)} 
                  placeholder="Minimum 6 characters" 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '6px' }} disabled={loading}>
              <UserPlus size={15} /> {loading ? 'Registering...' : 'Register Student Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
