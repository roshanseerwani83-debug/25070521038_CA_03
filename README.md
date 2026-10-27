# 🎓 CampusPulse — Academic & Coursework Workspace

> **Continuous Assessment 3 (CA3) — Flexi-Credit Full-Stack Web Development Project**  
> **Institution:** Symbiosis Institute of Technology (SIT), Nagpur  
> **Tech Stack:** JavaScript (React + Vite, Node.js + Express, MongoDB Compass) · HTML5 · Modern CSS

---

## 🌟 Overview & Key Enhancements

**CampusPulse** is an intelligent academic productivity and coursework workspace engineered for college students and faculty evaluation. It goes far beyond a basic to-do list by providing:

1. **📊 Academic KPI Dashboard:** Real-time metrics for total coursework, pending submissions, completed assignments, urgent priority items, and overall semester completion percentage with academic standing assessment.
2. **⏱️ Built-in Pomodoro Focus Timer:** 25-minute deep-work timer directly integrated into the dashboard to enhance student study habits.
3. **📋 Dual View Coursework Manager:** Seamlessly switch between a **Tabular List View** and a **Kanban Board** (`To Do` → `In Progress` → `Completed`).
4. **🎯 Comprehensive Task Schema:** Track Subject/Module tags, Course Codes (e.g., `CS201`, `CA3-FC`), Submission Categories (*Assignment, Lab Report, Project Milestone, Viva Prep, Quiz*), Priority (*Urgent, High, Medium, Low*), Deadlines, and Estimated Hours.
5. **✅ Milestone Subtasks / Checklist:** Break down complex assignments into actionable milestones with an auto-updating progress bar and celebratory completion feedback.
6. **📬 Campus Helpdesk & Inquiry Pipeline:** Direct student inquiry portal with roll number, subject selection, category tagging, and a dedicated inbox for faculty/mentor review.
7. **🍃 Seamless MongoDB Compass Integration with Graceful Fallback:**
   - Easily paste your MongoDB Compass connection string (e.g., `mongodb://localhost:27017` or Atlas link) in `server/.env`.
   - When Compass URI is left empty or database is offline during testing, the app automatically runs on a persistent local JSON database—guaranteeing **zero crashes** during viva evaluations!
8. **🌓 Theme Engine:** Instant Light & Dark mode toggle with persistent preference saving.
9. **📖 Viva Defense Cheat Sheet:** Dedicated `/about` section with frequently asked professor questions, architecture diagrams, and MERN concepts.

---

## 🏗️ Project Architecture

```
IIIT NAGPUR/
├── client/                     # Frontend Application (React 18 + Vite)
│   ├── index.html              # HTML5 entry with Plus Jakarta Sans & JetBrains Mono
│   ├── package.json            # React, React-Router-DOM, Lucide Icons, Canvas-Confetti
│   ├── vite.config.js          # Vite config with dev server proxy to port 5000
│   └── src/
│       ├── main.jsx            # React root with BrowserRouter
│       ├── App.jsx             # Main router & theme manager
│       ├── App.css             # Modern custom CSS with light/dark variables
│       ├── api.js              # Centralized API base configuration
│       ├── nav.jsx             # Header with live DB indicator & theme switcher
│       ├── dashboard.jsx       # Academic KPI metrics, Pomodoro timer & deadline radar
│       ├── tasks.jsx           # Coursework manager (List & Kanban perspectives)
│       ├── taskDetail.jsx      # Subtask checklist manager & assignment editor
│       ├── contact.jsx         # Campus helpdesk inquiry submission form
│       ├── messages.jsx        # Inquiries inbox with filter and delete actions
│       ├── about.jsx           # Architecture breakdown & Viva Q&A Cheat Sheet
│       └── notFound.jsx        # 404 handler
├── server/                     # Backend API (Node.js + Express + MongoDB)
│   ├── package.json            # Express, MongoDB, CORS, Dotenv
│   ├── server.js               # REST API endpoints & Dual-Storage Adapter
│   ├── .env                    # Configurable MongoDB Compass connection string
│   ├── .env.example            # Environment template
│   └── data/                   # Persistent local fallback storage (auto-generated)
│       ├── todos.json
│       └── messages.json
└── README.md                   # Comprehensive documentation & evaluation guide
```

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18+) installed on your machine.
- (Optional) MongoDB Compass running locally on `mongodb://localhost:27017`.

---

### Step 1: Start the Backend Server

```bash
cd server
npm start
```
* The server will run on `http://localhost:5000`.
* If `MONGODB_URI` in `.env` is set, it will connect to MongoDB Compass.
* If left empty, it runs immediately in local persistent storage mode!

---

### Step 2: Start the Frontend Client

Open a second terminal window:

```bash
cd client
npm run dev
```
* Open your browser at **`http://localhost:5173`**.

---

## 🍃 MongoDB Compass Configuration

To connect MongoDB Compass:
1. Open the file: **`server/.env`**
2. Paste your connection string into `MONGODB_URI`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017
   ```
   *(Or your MongoDB Atlas URI: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`)*
3. Restart the server (`npm start`).
4. The status badge in the top navigation will automatically switch from **`Local DB`** to **`Compass DB`**!

> **Note:** If you leave `MONGODB_URI=` empty, the application runs smoothly using the built-in local database. You can test and demonstrate the entire project immediately without needing MongoDB installed!

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/getall` / `/api/tasks` | Fetch all coursework tasks (supports search, status, priority, and subject filters) |
| `GET` | `/get/:id` / `/api/tasks/:id` | Fetch specific task by ID |
| `POST` | `/create` / `/api/tasks` | Create a new academic task |
| `PUT` | `/update/:id` / `/api/tasks/:id` | Update task details, subtasks, or completion status |
| `DELETE` | `/delete/:id` / `/api/tasks/:id` | Remove coursework item |
| `POST` | `/api/tasks/:id/toggle` | Quick toggle task completion |
| `POST` | `/api/tasks/seed` | Reset and re-seed demo academic coursework |
| `GET` | `/api/stats` | Retrieve aggregated analytics and subject distribution |
| `GET` | `/messages` / `/api/messages` | Fetch all student helpdesk inquiries |
| `POST` | `/contact` / `/api/messages` | Submit student query or doubt to the database |
| `DELETE` | `/messages/:id` / `/api/messages/:id` | Delete inquiry record |
| `GET` | `/api/status` | Check MongoDB Compass connection health |

---

## 🎓 Viva Defense Talking Points (For Examination)

When presenting to evaluators:
1. **Frontend Architecture:** Explain how pure React (Vite) with component modularity handles state via `useState` and `useEffect` without external heavyweight state libraries.
2. **Zero TypeScript Requirement:** Strictly built in clean modern JavaScript (`.jsx`, `.js`), semantic HTML5, and custom CSS variables for light/dark themes.
3. **Resilient Data Layer:** Emphasize the **Dual-Storage Adapter** in `server/server.js` which connects to MongoDB Compass via `MongoClient`, yet provides automatic fallback so evaluations never fail due to database downtime.
4. **Academic Domain Differentiation:** Highlight features like subtask milestone progress calculation, subject categorization (DSA, OS, Networks), Pomodoro focus intervals, and helpdesk inbox pipelines.

---

## 👤 Submission Details

* **Project:** Continuous Assessment 3 (CA3) — Flexi-Credit Full-Stack Web Development
* **Institution:** Symbiosis Institute of Technology (SIT), Nagpur
