import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  CheckSquare, 
  Inbox, 
  HelpCircle, 
  Info, 
  Moon, 
  Sun, 
  Database,
  LogIn,
  UserPlus,
  LogOut,
  User
} from 'lucide-react';
import API from './api';

const Nav = ({ theme, toggleTheme, currentUser, onOpenAuth, onLogout }) => {
  const [dbStatus, setDbStatus] = useState({
    isMongoConnected: false,
    storageMode: 'checking'
  });

  useEffect(() => {
    fetch(`${API}/api/status`)
      .then((res) => res.json())
      .then((data) => setDbStatus(data))
      .catch(() => {
        setDbStatus({ isMongoConnected: false, storageMode: 'local_store' });
      });
  }, []);

  const handleStatusClick = () => {
    if (dbStatus.isMongoConnected) {
      alert(`MongoDB Compass is actively connected!\nCollege: Symbiosis Institute of Technology (SIT), Nagpur\nDatabase: ${dbStatus.databaseName}\nURI: ${dbStatus.mongoUri}`);
    } else {
      alert(`Currently running with persistent local database for SIT Nagpur.\nTo connect MongoDB Compass:\n1. Open server/.env\n2. Set MONGODB_URI=mongodb://localhost:27017\n3. Restart server!`);
    }
  };

  return (
    <nav className="app-nav">
      <div className="nav-container">
        <NavLink to="/" className="brand">
          <div className="brand-icon">
            <GraduationCap size={20} />
          </div>
          <span>CampusPulse</span>
          <span className="brand-tag">SIT NAGPUR</span>
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CheckSquare size={16} />
            <span>Coursework</span>
          </NavLink>
          <NavLink to="/messages" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Inbox size={16} />
            <span>Inquiries</span>
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <HelpCircle size={16} />
            <span>Helpdesk</span>
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Info size={16} />
            <span>About & Viva</span>
          </NavLink>
        </div>

        <div className="nav-actions">
          {/* DB Indicator */}
          <button 
            type="button" 
            className="status-badge" 
            onClick={handleStatusClick} 
            title="Database Status (SIT Nagpur)"
          >
            <Database size={13} />
            <span className={`status-dot ${dbStatus.isMongoConnected ? 'online' : 'offline'}`} />
            <span>{dbStatus.isMongoConnected ? 'Compass DB' : 'Local DB'}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            type="button" 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            title="Toggle theme (Dark / Light)"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Auth Controls */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                className="user-pill" 
                title={`${currentUser.name} (${currentUser.branch || 'SIT Nagpur'})`}
              >
                <div className="user-avatar">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'S'}
                </div>
                <div className="user-details">
                  <span className="user-name">{currentUser.name.split(' ')[0]}</span>
                  {currentUser.prn && <span className="user-prn">{currentUser.prn}</span>}
                </div>
              </div>

              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={onLogout} 
                title="Sign Out"
                style={{ padding: '6px 10px' }}
              >
                <LogOut size={14} />
                <span className="hide-mobile">Sign Out</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => onOpenAuth('login')}
              >
                <LogIn size={14} /> Sign In
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-sm" 
                onClick={() => onOpenAuth('register')}
              >
                <UserPlus size={14} /> Register
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
