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
  Database 
} from 'lucide-react';
import API from './api';

const Nav = ({ theme, toggleTheme }) => {
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
      alert(`MongoDB Compass is actively connected!\nDatabase: ${dbStatus.databaseName}\nURI: ${dbStatus.mongoUri}`);
    } else {
      alert(`Currently running with persistent local database.\nTo connect MongoDB Compass:\n1. Open server/.env\n2. Set MONGODB_URI=mongodb://localhost:27017 (or your Atlas link)\n3. Restart the server!`);
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
          <span className="brand-tag">IIITN CA3</span>
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
          <button 
            type="button" 
            className="status-badge" 
            onClick={handleStatusClick} 
            title="Click to view database connection details"
          >
            <Database size={13} />
            <span className={`status-dot ${dbStatus.isMongoConnected ? 'online' : 'offline'}`} />
            <span>{dbStatus.isMongoConnected ? 'Compass DB' : 'Local DB'}</span>
          </button>

          <button 
            type="button" 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            title="Toggle theme (Dark / Light)"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
