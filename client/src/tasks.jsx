import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  LayoutList, 
  Kanban, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Sparkles,
  Filter,
  User,
  LogIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import API from './api';

const DEFAULT_SUBJECTS = [
  "Full-Stack Web Dev (Flexi Credit)",
  "Data Structures & Algorithms",
  "Operating Systems",
  "Computer Networks",
  "Database Management Systems",
  "Software Engineering",
  "Mathematics / Discrete Structures"
];

const Tasks = ({ currentUser, onOpenAuth }) => {
  const [todos, setTodos] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(DEFAULT_SUBJECTS[0]);
  const [priority, setPriority] = useState('Medium');
  const [type, setType] = useState('Assignment');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('23:59');
  const [notes, setNotes] = useState('');

  // Filters State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // All, Pending, Done
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterSubject, setFilterSubject] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate'); // dueDate, priority, title

  const loadTodos = async () => {
    try {
      const userId = currentUser?._id || '';
      const res = await fetch(`${API}/getall?userId=${userId}`);
      const data = await res.json();
      setTodos(data || []);
    } catch (err) {
      console.error('Failed to load todos:', err);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [currentUser]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(`${API}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?._id || '',
          title,
          subject,
          type,
          priority,
          dueDate,
          dueTime,
          notes,
          progress: 0,
          subtasks: [
            { id: '1', title: 'Review problem statement & guidelines', completed: false },
            { id: '2', title: 'Implement solution & test cases', completed: false },
            { id: '3', title: 'Final submission to SIT portal', completed: false }
          ]
        })
      });

      if (res.ok) {
        setTitle('');
        setNotes('');
        setDueDate('');
        setIsAdding(false);
        loadTodos();
      }
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  const handleToggle = async (todo) => {
    const nextDone = !todo.done;
    
    // Trigger festive confetti if marking as completed
    if (nextDone) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch (e) {
        // Safe fallback
      }
    }

    try {
      await fetch(`${API}/api/tasks/${todo._id}/toggle`, {
        method: 'POST'
      });
      loadTodos();
    } catch (err) {
      await fetch(`${API}/update/${todo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: nextDone })
      });
      loadTodos();
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this coursework item?')) return;
    try {
      await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
      loadTodos();
    } catch (err) {
      alert('Failed to delete task: ' + err.message);
    }
  };

  // Filter & Search Logic
  const filteredTodos = todos
    .filter((t) => {
      if (filterStatus === 'Done') return t.done;
      if (filterStatus === 'Pending') return !t.done;
      return true;
    })
    .filter((t) => (filterPriority === 'All' ? true : t.priority === filterPriority))
    .filter((t) => (filterSubject === 'All' ? true : t.subject === filterSubject))
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
      }
      if (sortBy === 'priority') {
        const order = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
        return (order[b.priority] || 0) - (order[a.priority] || 0);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

  const pendingCount = todos.filter((t) => !t.done).length;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 className="page-title">SIT Coursework & Tasks</h1>
            {currentUser?.prn && (
              <span className="brand-tag">PRN: {currentUser.prn}</span>
            )}
          </div>
          <p className="page-subtitle">
            {pendingCount} item{pendingCount !== 1 ? 's' : ''} requiring attention · Total {todos.length} registered for Symbiosis Institute of Technology
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="view-tabs">
            <button 
              type="button" 
              className={`view-tab ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <LayoutList size={15} /> List
            </button>
            <button 
              type="button" 
              className={`view-tab ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
            >
              <Kanban size={15} /> Kanban
            </button>
          </div>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={() => setIsAdding(!isAdding)}
          >
            <Plus size={16} /> {isAdding ? 'Close Form' : 'Add Coursework'}
          </button>
        </div>
      </div>

      {/* Add Coursework Expandable Form */}
      {isAdding && (
        <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--primary)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--primary)' }}>
            Register New Academic Coursework (SIT Nagpur)
          </h3>
          <form onSubmit={handleAddTodo}>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Task Title / Assignment Name *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="e.g. Implement B-Tree Indexing in C++"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject / Course Module</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {DEFAULT_SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Submission Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option>Assignment</option>
                  <option>Lab Report</option>
                  <option>Project Milestone</option>
                  <option>Viva Prep</option>
                  <option>Quiz/Exam</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option>Urgent</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Submission Deadline Date</label>
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Academic Notes & Submission Requirements</label>
                <textarea 
                  rows={3} 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Mention instructions, formatting guidelines, code links, or rubric details for SIT evaluation..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save & Add to Workspace
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar: Search, Filters & Sorting */}
      <div className="tasks-toolbar">
        <div className="search-input-wrapper">
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search assignments, subjects, or notes..." 
          />
        </div>

        <div className="filter-group">
          {/* Status Filter */}
          <div className="view-tabs">
            {['All', 'Pending', 'Done'].map((st) => (
              <button
                key={st}
                type="button"
                className={`view-tab ${filterStatus === st ? 'active' : ''}`}
                onClick={() => setFilterStatus(st)}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select 
            style={{ width: 'auto' }} 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Subject Filter */}
          <select 
            style={{ width: 'auto' }} 
            value={filterSubject} 
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            {DEFAULT_SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Sort By */}
          <select 
            style={{ width: 'auto' }} 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dueDate">Sort: Due Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="title">Sort: Title</option>
          </select>
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="tasks-list">
          {filteredTodos.map((todo) => (
            <div key={todo._id} className={`task-item ${todo.done ? 'completed' : ''}`}>
              <input 
                type="checkbox" 
                className="task-checkbox" 
                checked={todo.done} 
                onChange={() => handleToggle(todo)} 
                title={todo.done ? 'Mark as incomplete' : 'Mark as done'}
              />

              <div className="task-content">
                <Link to={`/task/${todo._id}`} className={`task-title ${todo.done ? 'completed' : ''}`}>
                  {todo.title}
                </Link>
                <div className="task-meta">
                  <span className="course-chip">
                    <BookOpen size={11} /> {todo.subject}
                  </span>
                  {todo.type && (
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                      • {todo.type}
                    </span>
                  )}
                  {todo.dueDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> Due: {todo.dueDate} {todo.dueTime && `(${todo.dueTime})`}
                    </span>
                  )}
                  {todo.subtasks && todo.subtasks.length > 0 && (
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                      ✓ {todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length} subtasks
                    </span>
                  )}
                </div>
              </div>

              <span className={`badge ${todo.priority}`}>{todo.priority}</span>

              <Link to={`/task/${todo._id}`} className="btn btn-secondary btn-sm" title="Edit details">
                Edit
              </Link>

              <button 
                type="button" 
                className="btn btn-danger btn-sm" 
                onClick={(e) => handleDelete(todo._id, e)}
                title="Delete coursework"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {filteredTodos.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                No coursework items match the current filters or search query.
              </p>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                style={{ marginTop: '12px' }}
                onClick={() => { setSearch(''); setFilterStatus('All'); setFilterPriority('All'); setFilterSubject('All'); }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="kanban-board">
          {/* Column: To Do / Backlog */}
          <div className="kanban-column">
            <div className="kanban-header">
              <span>📋 Backlog / To Do</span>
              <span className="kanban-count">
                {filteredTodos.filter(t => !t.done && (t.progress === 0 || !t.progress)).length}
              </span>
            </div>
            {filteredTodos
              .filter(t => !t.done && (t.progress === 0 || !t.progress))
              .map((todo) => (
                <div key={todo._id} className="kanban-card" onClick={() => handleToggle(todo)}>
                  <span className="course-chip" style={{ alignSelf: 'flex-start' }}>{todo.subject}</span>
                  <Link to={`/task/${todo._id}`} style={{ fontWeight: 700, fontSize: '14px' }}>
                    {todo.title}
                  </Link>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span className={`badge ${todo.priority}`}>{todo.priority}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{todo.dueDate || 'No date'}</span>
                  </div>
                </div>
              ))}
          </div>

          {/* Column: In Progress */}
          <div className="kanban-column">
            <div className="kanban-header">
              <span>⚡ In Progress</span>
              <span className="kanban-count">
                {filteredTodos.filter(t => !t.done && t.progress > 0 && t.progress < 100).length}
              </span>
            </div>
            {filteredTodos
              .filter(t => !t.done && t.progress > 0 && t.progress < 100)
              .map((todo) => (
                <div key={todo._id} className="kanban-card">
                  <span className="course-chip" style={{ alignSelf: 'flex-start' }}>{todo.subject}</span>
                  <Link to={`/task/${todo._id}`} style={{ fontWeight: 700, fontSize: '14px' }}>
                    {todo.title}
                  </Link>
                  <div className="progress-bar" style={{ height: '6px' }}>
                    <div className="progress-fill" style={{ width: `${todo.progress}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`badge ${todo.priority}`}>{todo.priority}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{todo.progress}%</span>
                  </div>
                </div>
              ))}
          </div>

          {/* Column: Completed */}
          <div className="kanban-column">
            <div className="kanban-header">
              <span>✅ Completed</span>
              <span className="kanban-count">
                {filteredTodos.filter(t => t.done).length}
              </span>
            </div>
            {filteredTodos
              .filter(t => t.done)
              .map((todo) => (
                <div key={todo._id} className="kanban-card" style={{ opacity: 0.8 }}>
                  <span className="course-chip" style={{ alignSelf: 'flex-start' }}>{todo.subject}</span>
                  <Link to={`/task/${todo._id}`} style={{ fontWeight: 700, fontSize: '14px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    {todo.title}
                  </Link>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge done-badge">Done</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{todo.dueDate}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
