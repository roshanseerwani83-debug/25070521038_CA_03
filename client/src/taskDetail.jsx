import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Plus, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
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

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [savedStatus, setSavedStatus] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    fetch(`${API}/get/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Task not found');
        return res.json();
      })
      .then((data) => {
        setTodo({
          title: '',
          subject: DEFAULT_SUBJECTS[0],
          courseCode: 'CS101',
          type: 'Assignment',
          priority: 'Medium',
          dueDate: '',
          dueTime: '23:59',
          estimatedHours: 2,
          progress: 0,
          notes: '',
          subtasks: [],
          done: false,
          ...data
        });
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (field, value) => {
    setTodo((prev) => ({ ...prev, [field]: value }));
    setSavedStatus('');
  };

  const handleSubtaskToggle = (subtaskId) => {
    const updatedSubtasks = (todo.subtasks || []).map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    const completedCount = updatedSubtasks.filter((s) => s.completed).length;
    const autoProgress = updatedSubtasks.length > 0 
      ? Math.round((completedCount / updatedSubtasks.length) * 100) 
      : todo.progress;

    setTodo({
      ...todo,
      subtasks: updatedSubtasks,
      progress: autoProgress,
      done: autoProgress === 100
    });
    setSavedStatus('');
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSub = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      completed: false
    };

    const updatedSubtasks = [...(todo.subtasks || []), newSub];
    setTodo({ ...todo, subtasks: updatedSubtasks });
    setNewSubtaskTitle('');
    setSavedStatus('');
  };

  const handleDeleteSubtask = (subtaskId) => {
    const updatedSubtasks = (todo.subtasks || []).filter((s) => s.id !== subtaskId);
    setTodo({ ...todo, subtasks: updatedSubtasks });
    setSavedStatus('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: todo.title,
          subject: todo.subject,
          courseCode: todo.courseCode,
          type: todo.type,
          priority: todo.priority,
          dueDate: todo.dueDate,
          dueTime: todo.dueTime,
          estimatedHours: todo.estimatedHours,
          progress: todo.progress,
          notes: todo.notes,
          subtasks: todo.subtasks,
          done: todo.done
        })
      });

      if (res.ok) {
        setSavedStatus('Coursework changes saved successfully!');
        setTimeout(() => setSavedStatus(''), 3000);
      }
    } catch (err) {
      alert('Error updating coursework: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this coursework record?')) return;
    try {
      await fetch(`${API}/delete/${id}`, { method: 'DELETE' });
      navigate('/tasks');
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading coursework details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !todo) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Coursework Item Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            The requested task record might have been removed.
          </p>
          <Link to="/tasks" className="btn btn-primary">
            <ArrowLeft size={16} /> Return to Coursework
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: '20px' }}>
        <Link to="/tasks" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--primary)' }}>
          <ArrowLeft size={16} /> Back to Coursework List
        </Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <span className="course-chip" style={{ marginBottom: '8px' }}>
              <BookOpen size={12} /> {todo.subject}
            </span>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>
              Edit Coursework Details
            </h1>
            {todo.createdAt && (
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Created on {new Date(todo.createdAt).toLocaleString()}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>
              <Trash2 size={15} /> Delete Task
            </button>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Task Title / Assignment Name *</label>
              <input 
                type="text" 
                value={todo.title} 
                onChange={(e) => handleChange('title', e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Subject / Course</label>
              <select value={todo.subject} onChange={(e) => handleChange('subject', e.target.value)}>
                {DEFAULT_SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Course Code</label>
              <input 
                type="text" 
                value={todo.courseCode || ''} 
                onChange={(e) => handleChange('courseCode', e.target.value)} 
                placeholder="e.g. CS201, CA3-FC"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Submission Category</label>
              <select value={todo.type} onChange={(e) => handleChange('type', e.target.value)}>
                <option>Assignment</option>
                <option>Lab Report</option>
                <option>Project Milestone</option>
                <option>Viva Prep</option>
                <option>Quiz/Exam</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select value={todo.priority} onChange={(e) => handleChange('priority', e.target.value)}>
                <option>Urgent</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input 
                type="date" 
                value={todo.dueDate} 
                onChange={(e) => handleChange('dueDate', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Time (Deadline)</label>
              <input 
                type="time" 
                value={todo.dueTime || '23:59'} 
                onChange={(e) => handleChange('dueTime', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Effort (Hours)</label>
              <input 
                type="number" 
                min="1" 
                max="100" 
                value={todo.estimatedHours || 2} 
                onChange={(e) => handleChange('estimatedHours', e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Progress: {todo.progress || 0}%</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={todo.progress || 0} 
                onChange={(e) => handleChange('progress', Number(e.target.value))} 
              />
            </div>
          </div>

          {/* Subtasks / Checklist Manager */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--primary)' }} /> 
              Assignment Subtasks & Milestone Checklist
            </h3>

            <div style={{ marginBottom: '12px' }}>
              {(todo.subtasks || []).map((sub) => (
                <div key={sub.id} className="checklist-item">
                  <input 
                    type="checkbox" 
                    checked={sub.completed} 
                    onChange={() => handleSubtaskToggle(sub.id)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span style={{ flex: 1, fontSize: '14px', textDecoration: sub.completed ? 'line-through' : 'none', color: sub.completed ? 'var(--text-muted)' : 'var(--text-main)' }}>
                    {sub.title}
                  </span>
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm" 
                    style={{ padding: '2px 6px' }}
                    onClick={() => handleDeleteSubtask(sub.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={newSubtaskTitle} 
                onChange={(e) => setNewSubtaskTitle(e.target.value)} 
                placeholder="Add new subtask milestone (e.g. Test edge cases, write readme)..."
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddSubtask}>
                <Plus size={15} /> Add
              </button>
            </div>
          </div>

          {/* Notes & Submission Requirements */}
          <div style={{ marginTop: '24px' }}>
            <label className="form-label">Instructions, Notes & References</label>
            <textarea 
              rows={5} 
              value={todo.notes} 
              onChange={(e) => handleChange('notes', e.target.value)} 
              placeholder="Paste rubric guidelines, submission drive links, repository URLs, or study notes..."
            />
          </div>

          {/* Mark Complete Checkbox */}
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              id="doneCheck" 
              checked={todo.done} 
              onChange={(e) => {
                const checked = e.target.checked;
                handleChange('done', checked);
                if (checked) handleChange('progress', 100);
              }}
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="doneCheck" style={{ fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
              Mark this entire coursework submission as Completed
            </label>
          </div>

          {/* Save Status & Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <div>
              {savedStatus && (
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '14px' }}>
                  ✓ {savedStatus}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/tasks" className="btn btn-secondary">
                Back
              </Link>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskDetail;
