import { 
  GraduationCap, 
  Layers, 
  Database, 
  Server, 
  Layout, 
  CheckCircle, 
  HelpCircle,
  FileCode,
  ShieldCheck,
  Award
} from 'lucide-react';

const About = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">About CampusPulse & Viva Guide</h1>
          <p className="page-subtitle">
            Continuous Assessment 3 (CA3) — Full-Stack Flexi Credit Project Documentation
          </p>
        </div>
      </div>

      {/* Project Overview */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>CampusPulse: Academic Coursework & Productivity Workspace</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Designed for Symbiosis Institute of Technology (SIT), Nagpur
            </p>
          </div>
        </div>

        <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          CampusPulse is a comprehensive, production-ready Full-Stack Web Application tailored for engineering students to track, plan, and execute coursework, assignments, laboratory deliverables, and faculty queries. Unlike standard todo applications, CampusPulse incorporates multi-subject classification, subtask milestones, time estimations, a Pomodoro focus timer, dual Kanban/List perspectives, and an integrated campus helpdesk query pipeline connected to MongoDB Compass.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '6px' }}>
              <Layout size={18} style={{ color: 'var(--primary)' }} /> Frontend Layer
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              React 18 + Vite (Pure JavaScript / JSX), modern modular CSS, responsive design, dark & light theme engine.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '6px' }}>
              <Server size={18} style={{ color: 'var(--primary)' }} /> Backend API
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Node.js + Express.js REST API on port 5000, supporting standard CRUD, multi-criteria filtering, sorting, and analytics aggregation.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, marginBottom: '6px' }}>
              <Database size={18} style={{ color: 'var(--primary)' }} /> Database Layer
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              MongoDB Compass compatible via official <code>mongodb</code> driver with graceful local fallback store for 100% uptime.
            </p>
          </div>
        </div>
      </div>

      {/* System Architecture Flow */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} style={{ color: 'var(--primary)' }} /> System Architecture & Data Flow
        </h3>
        
        <div style={{ padding: '20px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.8', overflowX: 'auto' }}>
          <div>[ React Client (Port 5173) ]</div>
          <div>  │</div>
          <div>  ├── Fetch API Requests (REST Endpoints) ──► [ Express Server (Port 5000) ]</div>
          <div>  │                                              │</div>
          <div>  │                                              ├── Check process.env.MONGODB_URI</div>
          <div>  │                                              │    ├── Connected ──► [ MongoDB Compass ] (todoDb / campuspulseDb)</div>
          <div>  │                                              │    └── Pending   ──► [ Local File Store ] (data/todos.json)</div>
          <div>  │                                              │</div>
          <div>  └── State Updates (useState / useEffect) ◄─────┘ JSON Response</div>
        </div>
      </div>

      {/* Viva Defense Cheat Sheet */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={20} style={{ color: 'var(--primary)' }} /> Viva Defense & Evaluation Q&A Cheat Sheet
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Frequently asked questions by faculty evaluators during CA3 project viva and presentation:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
              Q1: How does the application connect to MongoDB Compass?
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong>Answer:</strong> The backend uses the official <code>mongodb</code> native driver via <code>MongoClient</code>. The connection string (e.g., <code>mongodb://localhost:27017</code>) is loaded from the environment file <code>server/.env</code>. The application automatically accesses collections named <code>todos</code> and <code>messages</code> inside the database. If Compass is offline, our fail-safe adapter ensures zero downtime.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
              Q2: What is the purpose of CORS middleware in the Express server?
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong>Answer:</strong> Cross-Origin Resource Sharing (CORS) is a browser security mechanism that restricts HTTP requests initiated from scripts running on one origin (e.g., React on port 5173) to a different origin (e.g., Express on port 5000). The <code>cors()</code> middleware adds appropriate HTTP headers (<code>Access-Control-Allow-Origin</code>) allowing our client to communicate securely with the server.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
              Q3: How are React Hooks utilized for state and side-effects?
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong>Answer:</strong> We utilize <code>useState</code> for dynamic component state (task lists, filters, form inputs, Pomodoro countdown) and <code>useEffect</code> for lifecycle side-effects (fetching data on component mount, managing the 1-second interval timer, and synchronizing user theme preferences to localStorage).
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)', marginBottom: '6px' }}>
              Q4: Why choose MongoDB (NoSQL) over traditional SQL for this coursework project?
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <strong>Answer:</strong> Coursework and academic assignments have hierarchical, flexible structures (e.g., embedded subtask checklists, dynamic tags, variable metadata). MongoDB's document-based JSON/BSON format maps naturally to JavaScript objects without requiring complex multi-table joins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
