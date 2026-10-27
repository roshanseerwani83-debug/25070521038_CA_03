import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ textAlign: 'center', padding: '50px 30px', maxWidth: '480px' }}>
        <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: '50%', marginBottom: '16px' }}>
          <AlertTriangle size={36} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>404 — Page Not Found</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: '1.6' }}>
          The academic page or resource you are looking for does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
