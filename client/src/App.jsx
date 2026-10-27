import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from './nav.jsx';
import Dashboard from './dashboard.jsx';
import Tasks from './tasks.jsx';
import TaskDetail from './taskDetail.jsx';
import Messages from './messages.jsx';
import About from './about.jsx';
import Contact from './contact.jsx';
import NotFound from './notFound.jsx';
import AuthModal from './AuthModal.jsx';
import './App.css';

const App = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('campuspulse_theme') || 'light';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campuspulse_user');
      return saved ? JSON.parse(saved) : {
        _id: "671e00a1b2c3d4e5f6000099",
        name: "Roshan Sharma",
        prn: "23070123001",
        email: "roshan@sitnagpur.siu.edu.in",
        branch: "Computer Science & Engineering",
        year: "3rd Year (Semester 5)",
        college: "Symbiosis Institute of Technology (SIT), Nagpur"
      };
    } catch (e) {
      return null;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('campuspulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    if (window.confirm(`Sign out ${currentUser?.name || 'from SIT Nagpur CampusPulse'}?`)) {
      localStorage.removeItem('campuspulse_user');
      localStorage.removeItem('campuspulse_token');
      setCurrentUser(null);
    }
  };

  return (
    <>
      <Nav 
        theme={theme} 
        toggleTheme={toggleTheme} 
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <Dashboard 
                currentUser={currentUser} 
                onOpenAuth={handleOpenAuth} 
              />
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <Tasks 
                currentUser={currentUser} 
                onOpenAuth={handleOpenAuth} 
              />
            } 
          />
          <Route path="/task/:id" element={<TaskDetail currentUser={currentUser} />} />
          <Route path="/messages" element={<Messages currentUser={currentUser} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact currentUser={currentUser} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      <footer className="app-footer">
        <p>
          CampusPulse · Academic & Coursework Workspace · Symbiosis Institute of Technology (SIT), Nagpur
        </p>
        <p style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
          Developed for Continuous Assessment 3 (CA3) Flexi-Credit · React + Node.js + MongoDB Compass
        </p>
      </footer>
    </>
  );
};

export default App;
