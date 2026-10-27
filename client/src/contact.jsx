import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, AlertCircle, HelpCircle, Mail, User, BookOpen } from 'lucide-react';
import API from './api';

const Contact = () => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Full-Stack Web Dev (Flexi Credit)');
  const [category, setCategory] = useState('Assignment Doubt');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please complete all required fields (Name, Email, Message).' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', text: '' });

    try {
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          rollNo: rollNo.trim(),
          email: email.trim(),
          subject,
          category,
          message: message.trim()
        })
      });

      if (res.ok) {
        setStatus({
          type: 'success',
          text: 'Academic inquiry submitted successfully! Recorded in database.'
        });
        setName('');
        setRollNo('');
        setEmail('');
        setMessage('');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus({ type: 'error', text: data.error || 'Failed to submit inquiry.' });
      }
    } catch (err) {
      setStatus({ type: 'error', text: 'Could not connect to backend server: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Academic Helpdesk</h1>
          <p className="page-subtitle">
            Submit coursework queries, lab doubts, or faculty evaluation requests directly to the database.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        <div className="card">
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={20} style={{ color: 'var(--primary)' }} /> Coursework Inquiry Form
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Roshan Sharma"
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Student Roll No.</label>
                <input 
                  type="text" 
                  value={rollNo} 
                  onChange={(e) => setRollNo(e.target.value)} 
                  placeholder="e.g. BT23CSE042"
                />
              </div>

              <div className="form-group">
                <label className="form-label">College / Official Email *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="e.g. roshan@iiitn.ac.in"
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Relevant Course / Subject</label>
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option>Full-Stack Web Dev (Flexi Credit)</option>
                  <option>Data Structures & Algorithms</option>
                  <option>Operating Systems</option>
                  <option>Computer Networks</option>
                  <option>Database Management Systems</option>
                  <option>General Academic Query</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Inquiry Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option>Assignment Doubt</option>
                  <option>Lab Evaluation Assistance</option>
                  <option>CA3 Flexi-Credit Milestone Query</option>
                  <option>Faculty / Mentor Appointment</option>
                  <option>Technical Feedback</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Detailed Query / Message *</label>
                <textarea 
                  rows={4} 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Describe your question, doubt, or request in detail..."
                  required 
                />
              </div>
            </div>

            {status.text && (
              <div 
                style={{ 
                  marginTop: '16px', 
                  padding: '12px 16px', 
                  borderRadius: 'var(--radius-md)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  background: status.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: status.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span>{status.text}</span>
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                <Send size={15} /> {isSubmitting ? 'Submitting...' : 'Send Inquiry'}
              </button>
            </div>
          </form>
        </div>

        {/* Info & Fast Contact Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '10px' }}>
              ℹ️ About Student Helpdesk
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              All inquiries submitted through this portal are saved into the backend database (MongoDB Compass or persistent store) and can be reviewed, answered, and managed in the <Link to="/messages" style={{ color: 'var(--primary)', fontWeight: 700 }}>Inquiries</Link> tab.
            </p>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '10px' }}>
              🎓 Continuous Assessment (CA3)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Department of Computer Science & Engineering<br />
              <strong>Indian Institute of Information Technology, Nagpur</strong><br />
              Flexi Credit Course: Full-Stack Web Development
            </p>
            <div style={{ marginTop: '16px' }}>
              <Link to="/messages" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                View All Received Inquiries →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
