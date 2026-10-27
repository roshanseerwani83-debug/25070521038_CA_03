import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  Trash2, 
  Mail, 
  User, 
  Calendar, 
  CheckCircle, 
  BookOpen, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import API from './api';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/messages`);
      const data = await res.json();
      setMessages(data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry from the database?')) return;
    try {
      await fetch(`${API}/messages/${id}`, { method: 'DELETE' });
      loadMessages();
    } catch (err) {
      alert('Failed to delete inquiry: ' + err.message);
    }
  };

  const filteredMessages = messages.filter((m) =>
    filterCategory === 'All' ? true : m.category === filterCategory
  );

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Helpdesk Inquiries</h1>
          <p className="page-subtitle">
            {messages.length} message{messages.length !== 1 ? 's' : ''} received from the student contact desk
          </p>
        </div>

        <div>
          <Link to="/contact" className="btn btn-primary btn-sm">
            <MessageSquare size={14} /> Submit New Query
          </Link>
        </div>
      </div>

      {/* Filter by Category */}
      <div className="tasks-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700 }}>Filter Category:</span>
          <select 
            style={{ width: 'auto' }} 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Assignment Doubt">Assignment Doubt</option>
            <option value="Lab Evaluation Assistance">Lab Evaluation Assistance</option>
            <option value="CA3 Flexi-Credit Milestone Query">CA3 Flexi-Credit</option>
            <option value="Course Query">Course Query</option>
          </select>
        </div>

        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing {filteredMessages.length} of {messages.length}
        </span>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading inquiries from database...</p>
        </div>
      ) : filteredMessages.length > 0 ? (
        <div>
          {filteredMessages.map((msg) => (
            <div key={msg._id} className="message-card">
              <div className="message-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '16px' }}>{msg.name}</span>
                    {msg.rollNo && (
                      <span style={{ background: 'var(--bg-surface-hover)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: 600 }}>
                        {msg.rollNo}
                      </span>
                    )}
                    <span className="badge Medium">{msg.category || 'General'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <a href={`mailto:${msg.email}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)' }}>
                      <Mail size={12} /> {msg.email}
                    </a>
                    {msg.subject && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BookOpen size={12} /> {msg.subject}
                      </span>
                    )}
                    {msg.createdAt && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <Calendar size={12} /> {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  type="button" 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDelete(msg._id)}
                  title="Delete message"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', fontSize: '14px', lineHeight: '1.6' }}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Inbox size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>No Inquiries Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
            No messages currently match this filter. Anyone submitting the contact form will show up here.
          </p>
          <Link to="/contact" className="btn btn-secondary btn-sm">
            Go to Contact Desk
          </Link>
        </div>
      )}
    </div>
  );
};

export default Messages;
