import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Flame, 
  BookOpen, 
  Calendar, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight,
  Sparkles,
  Download,
  LogIn,
  GraduationCap
} from 'lucide-react';
import API from './api';

const Dashboard = ({ currentUser, onOpenAuth }) => {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    done: 0,
    pending: 0,
    urgent: 0,
    high: 0,
    percent: 0,
    dueToday: 0,
    overdue: 0,
    subjects: {}
  });
  const [loading, setLoading] = useState(true);

  // Pomodoro timer state (25 mins = 1500 secs)
  const [pomodoroSeconds, setPomodoroSeconds] = useState(1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const loadData = () => {
    setLoading(true);
    const userId = currentUser?._id || '';
    Promise.all([
      fetch(`${API}/getall?userId=${userId}`).then((r) => r.json()).catch(() => []),
      fetch(`${API}/api/stats?userId=${userId}`).then((r) => r.json()).catch(() => ({}))
    ]).then(([taskList, statsData]) => {
      setTodos(taskList || []);
      if (statsData && statsData.total !== undefined) {
        setStats(statsData);
      } else {
        const total = (taskList || []).length;
        const done = (taskList || []).filter((t) => t.done).length;
        setStats({
          total,
          done,
          pending: total - done,
          urgent: (taskList || []).filter((t) => !t.done && t.priority === 'Urgent').length,
          high: (taskList || []).filter((t) => !t.done && t.priority === 'High').length,
          percent: total === 0 ? 0 : Math.round((done / total) * 100),
          dueToday: (taskList || []).filter((t) => !t.done && t.dueDate === new Date().toISOString().slice(0, 10)).length,
          overdue: 0,
          subjects: {}
        });
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((sec) => sec - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setIsTimerRunning(false);
      alert('Focus session completed! Take a 5-minute breather.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, pomodoroSeconds]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setPomodoroSeconds(1500);
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeedTasks = async () => {
    if (!window.confirm('Reset and load initial sample coursework tasks for SIT Nagpur?')) return;
    try {
      await fetch(`${API}/api/tasks/seed`, { method: 'POST' });
      loadData();
    } catch (err) {
      alert('Failed to seed tasks: ' + err.message);
    }
  };

  const exportToJson = () => {
    const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIT_Nagpur_Coursework_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const dueTodayTasks = todos.filter((t) => !t.done && t.dueDate === todayStr);
  const upcomingTasks = todos.filter((t) => !t.done && t.dueDate && t.dueDate > todayStr).slice(0, 3);

  const getGradeAssessment = (pct) => {
    if (pct >= 85) return { grade: 'Grade A+ (Distinction)', desc: 'Remarkable pace! Coursework well ahead of schedule.' };
    if (pct >= 70) return { grade: 'Grade A (Good Standing)', desc: 'Steady academic progress on track.' };
    if (pct >= 50) return { grade: 'Grade B (Average)', desc: 'Decent, but several assignments remain pending.' };
    return { grade: 'Urgent Attention', desc: 'High volume of pending submissions.' };
  };

  const assessment = getGradeAssessment(stats.percent);

  return (
    <div className="page-wrapper">
      {/* Student Profile Banner */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.07), rgba(168, 85, 247, 0.05))', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="brand-icon" style={{ width: '44px', height: '44px', borderRadius: '50%' }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800 }}>
                  {currentUser ? `Welcome, ${currentUser.name}` : 'Welcome, Guest Student'}
                </h2>
                <span className="brand-tag">SIT NAGPUR</span>
                {currentUser?.prn && (
                  <span className="course-chip">PRN: {currentUser.prn}</span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {currentUser ? `${currentUser.branch || 'CSE'} · ${currentUser.year || '3rd Year'}` : 'Sign in to sync coursework to your personal student PRN'} · Symbiosis Institute of Technology
              </p>
            </div>
          </div>

          <div>
            {!currentUser && (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => onOpenAuth('login')}>
                <LogIn size={14} /> Student Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Dashboard</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} · Continuous Assessment 3 (CA3)
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleSeedTasks} title="Load sample academic tasks">
            <Sparkles size={14} /> Seed SIT Tasks
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={exportToJson} title="Export coursework as JSON">
            <Download size={14} /> Export Backup
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <b>{stats.total}</b>
            <span>Total Coursework</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <b>{stats.pending}</b>
            <span>Pending Deadlines</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <b>{stats.done}</b>
            <span>Completed Items</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <Flame size={24} />
          </div>
          <div className="stat-info">
            <b>{stats.urgent + stats.high}</b>
            <span>Urgent / High Priority</span>
          </div>
        </div>
      </div>

      {/* Progress & Academic Standing */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="progress-header">
          <span>Overall Coursework Completion</span>
          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{stats.percent}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${stats.percent}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px' }}>
          <span style={{ fontWeight: 600 }}>Standing: <span style={{ color: 'var(--primary)' }}>{assessment.grade}</span></span>
          <span style={{ color: 'var(--text-muted)' }}>{assessment.desc}</span>
        </div>
      </div>

      {/* Pomodoro Focus Study Timer */}
      <div className="pomodoro-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Clock size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '16px' }}>Study Focus Timer (Pomodoro)</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            25-minute deep-work interval to boost your SIT Nagpur assignment retention and focus.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="timer-display">{formatTimer(pomodoroSeconds)}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              className={`btn ${isTimerRunning ? 'btn-secondary' : 'btn-primary'}`} 
              onClick={toggleTimer}
            >
              {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
              {isTimerRunning ? 'Pause' : 'Start Focus'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetTimer} title="Reset to 25 mins">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Due Today & Upcoming Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--primary)' }} /> Due Today ({dueTodayTasks.length})
            </h3>
            <Link to="/tasks" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {dueTodayTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '16px 0', textAlign: 'center' }}>
              No tasks due today. Excellent time to review upcoming subjects!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {dueTodayTasks.map((todo) => (
                <div key={todo._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <Link to={`/task/${todo._id}`} style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                      {todo.title}
                    </Link>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {todo.subject} {todo.dueTime && `· by ${todo.dueTime}`}
                    </div>
                  </div>
                  <span className={`badge ${todo.priority}`}>{todo.priority}</span>
                </div>
              ))}
            </div>
          )}

          {upcomingTasks.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Upcoming Submissions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {upcomingTasks.map((todo) => (
                  <div key={todo._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <Link to={`/task/${todo._id}`} style={{ fontWeight: 600 }}>
                      {todo.title}
                    </Link>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{todo.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subjects & Quick Action Hub */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} style={{ color: 'var(--primary)' }} /> Coursework Modules (SIT Nagpur)
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Active subjects and modules tracked under Continuous Assessment (CA3):
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {Object.keys(stats.subjects || {}).length > 0 ? (
              Object.entries(stats.subjects).map(([subjectName, count]) => (
                <div key={subjectName} className="course-chip">
                  <span>{subjectName}</span>
                  <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                DSA, Operating Systems, Networks, Flexi Credit Fullstack
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/tasks" className="btn btn-primary" style={{ width: '100%' }}>
              Manage Coursework & Assignments <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="btn btn-secondary" style={{ width: '100%' }}>
              Submit Query to SIT Helpdesk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
