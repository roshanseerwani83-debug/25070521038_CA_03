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
import './App.css';

const App = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('campuspulse_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('campuspulse_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      <Nav theme={theme} toggleTheme={toggleTheme} />

      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="app-footer">
        <p>
          CampusPulse · Academic & Coursework Workspace · React + Node.js + MongoDB Compass
        </p>
        <p style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
          Developed for Continuous Assessment 3 (CA3) — Indian Institute of Information Technology, Nagpur
        </p>
      </footer>
    </>
  );
};

export default App;
