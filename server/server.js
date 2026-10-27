require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure fallback data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const todosFilePath = path.join(dataDir, 'todos.json');
const messagesFilePath = path.join(dataDir, 'messages.json');
const usersFilePath = path.join(dataDir, 'users.json');

// Helper functions for fallback local file storage
function readLocalFile(filePath, defaultData = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

function writeLocalFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Initial default user for SIT Nagpur
const defaultUsers = [
  {
    _id: "671e00a1b2c3d4e5f6000099",
    name: "Roshan Sharma",
    prn: "23070123001",
    email: "roshan@sitnagpur.siu.edu.in",
    password: "password123",
    branch: "Computer Science & Engineering",
    year: "3rd Year (Semester 5)",
    college: "Symbiosis Institute of Technology (SIT), Nagpur",
    createdAt: new Date()
  }
];

// Initial SIT Nagpur Coursework Sample Data
const initialAcademicTodos = [
  {
    _id: "671e01a1b2c3d4e5f6000001",
    userId: "671e00a1b2c3d4e5f6000099",
    title: "Implement Dijkstra's Algorithm in C++",
    subject: "Data Structures & Algorithms",
    courseCode: "CS201",
    type: "Lab Report",
    priority: "High",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    dueTime: "23:59",
    estimatedHours: 4,
    progress: 75,
    notes: "Implement adjacency list representation and min-heap priority queue. Submit PDF report with time complexity analysis and screenshots.",
    subtasks: [
      { id: "1", title: "Write graph adjacency list class", completed: true },
      { id: "2", title: "Implement min-heap priority queue", completed: true },
      { id: "3", title: "Run benchmark on 10,000 vertices", completed: true },
      { id: "4", title: "Write observation report and complexity analysis", completed: false }
    ],
    done: false,
    createdAt: new Date(Date.now() - 86400000 * 3)
  },
  {
    _id: "671e01a1b2c3d4e5f6000002",
    userId: "671e00a1b2c3d4e5f6000099",
    title: "Flexi-Credit CA3 Project: MERN Academic Workspace",
    subject: "Full-Stack Web Dev (Flexi Credit)",
    courseCode: "CA3-FC",
    type: "Project Milestone",
    priority: "Urgent",
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: "17:00",
    estimatedHours: 8,
    progress: 90,
    notes: "Develop full-stack React + Node.js + MongoDB coursework planner for SIT Nagpur CA3 submission with authentication, responsive dashboard, task management, helpdesk messaging, and viva documentation.",
    subtasks: [
      { id: "1", title: "Design REST API endpoints with Express", completed: true },
      { id: "2", title: "Implement Student Sign-Up & Sign-In Auth", completed: true },
      { id: "3", title: "Build React frontend with dashboard metrics", completed: true },
      { id: "4", title: "Configure MongoDB Compass connectivity", completed: true }
    ],
    done: false,
    createdAt: new Date(Date.now() - 86400000 * 5)
  },
  {
    _id: "671e01a1b2c3d4e5f6000003",
    userId: "671e00a1b2c3d4e5f6000099",
    title: "Operating Systems: Process Synchronization Semaphores",
    subject: "Operating Systems",
    courseCode: "CS301",
    type: "Assignment",
    priority: "Medium",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10),
    dueTime: "14:00",
    estimatedHours: 3,
    progress: 100,
    notes: "Solve the Producer-Consumer and Dining Philosophers problems using POSIX semaphores in Linux.",
    subtasks: [
      { id: "1", title: "Review textbook chapter 6 (Silberschatz)", completed: true },
      { id: "2", title: "Code producer_consumer.c with sem_wait/sem_post", completed: true },
      { id: "3", title: "Verify deadlock-free execution", completed: true }
    ],
    done: true,
    createdAt: new Date(Date.now() - 86400000 * 7)
  },
  {
    _id: "671e01a1b2c3d4e5f6000004",
    userId: "671e00a1b2c3d4e5f6000099",
    title: "Computer Networks: Wireshark Packet Analysis Lab",
    subject: "Computer Networks",
    courseCode: "CS302",
    type: "Lab Report",
    priority: "Medium",
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
    dueTime: "20:00",
    estimatedHours: 2,
    progress: 30,
    notes: "Capture HTTP 3-way handshake and DNS query packets. Identify SEQ/ACK numbers and TCP window sizes.",
    subtasks: [
      { id: "1", title: "Capture TCP packets via Wireshark", completed: true },
      { id: "2", title: "Extract SYN, SYN-ACK, ACK packet headers", completed: false },
      { id: "3", title: "Complete lab observation sheet", completed: false }
    ],
    done: false,
    createdAt: new Date(Date.now() - 86400000 * 2)
  }
];

// Initialize fallback files
if (!fs.existsSync(todosFilePath)) {
  writeLocalFile(todosFilePath, initialAcademicTodos);
}
if (!fs.existsSync(usersFilePath)) {
  writeLocalFile(usersFilePath, defaultUsers);
}
if (!fs.existsSync(messagesFilePath)) {
  writeLocalFile(messagesFilePath, [
    {
      _id: "671e02b2c3d4e5f600000001",
      name: "Roshan Sharma",
      rollNo: "23070123001",
      email: "roshan@sitnagpur.siu.edu.in",
      category: "Course Query",
      subject: "Flexi-Credit CA3 Submission Clarification",
      message: "Respected Faculty, submitting the completed full-stack academic project for SIT Nagpur CA3 flexi-credit evaluation. All modules including student authentication, dashboard, tasks, MongoDB compass compatibility, and messages are operational.",
      status: "Reviewed",
      createdAt: new Date(Date.now() - 86400000)
    }
  ]);
}

let isMongoConnected = false;
let db = null;
let mongoClient = null;

const mongoUri = (process.env.MONGODB_URI || "").trim();
const dbName = "campuspulseDb";

async function initDatabase() {
  if (mongoUri) {
    try {
      console.log(`Attempting to connect to MongoDB Compass at: ${mongoUri}`);
      mongoClient = new MongoClient(mongoUri, {
        serverSelectionTimeoutMS: 2500
      });
      await mongoClient.connect();
      db = mongoClient.db(dbName);
      isMongoConnected = true;
      console.log(`>>> MongoDB Compass connection established successfully to database: "${dbName}"`);
      
      // Seed default users if empty
      const userCount = await db.collection("users").countDocuments();
      if (userCount === 0) {
        await db.collection("users").insertMany(defaultUsers);
      }

      // Seed initial todos if collection is empty
      const count = await db.collection("todos").countDocuments();
      if (count === 0) {
        await db.collection("todos").insertMany(initialAcademicTodos);
        console.log("Seeded initial academic tasks into MongoDB collection 'todos'");
      }
    } catch (err) {
      console.warn(`[Notice] Could not connect to MongoDB at "${mongoUri}": ${err.message}`);
      console.warn(`[Fallback] Running with local persistent JSON database.`);
      isMongoConnected = false;
    }
  } else {
    console.log(`[Notice] MONGODB_URI is empty in .env. Running with local persistent JSON database.`);
    console.log(`[Tip] You can paste your MongoDB Compass URI (e.g. mongodb://localhost:27017) in .env anytime!`);
  }
}

// -------------------------------------------------------------
// System Status API
// -------------------------------------------------------------
app.get('/api/status', (req, res) => {
  res.json({
    status: "ok",
    college: "Symbiosis Institute of Technology (SIT), Nagpur",
    storageMode: isMongoConnected ? "mongodb" : "local_store",
    isMongoConnected,
    mongoUri: mongoUri || "Not set (empty)",
    databaseName: isMongoConnected ? dbName : "local_file_db",
    serverTime: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// Student Authentication Routes (Register, Login, Me)
// -------------------------------------------------------------

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, prn, email, password, branch, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPrn = (prn || "").trim();

    let existingUser = null;
    if (isMongoConnected && db) {
      existingUser = await db.collection("users").findOne({
        $or: [{ email: cleanEmail }, ...(cleanPrn ? [{ prn: cleanPrn }] : [])]
      });
    } else {
      const users = readLocalFile(usersFilePath, defaultUsers);
      existingUser = users.find(u => u.email.toLowerCase() === cleanEmail || (cleanPrn && u.prn === cleanPrn));
    }

    if (existingUser) {
      return res.status(400).json({ error: "A student with this Email or PRN is already registered" });
    }

    const newUser = {
      name: name.trim(),
      prn: cleanPrn || `PRN${Date.now().toString().slice(-6)}`,
      email: cleanEmail,
      password: password, // In production, hash with bcrypt
      branch: branch || "Computer Science & Engineering",
      year: year || "3rd Year",
      college: "Symbiosis Institute of Technology (SIT), Nagpur",
      createdAt: new Date()
    };

    let savedUserId;
    if (isMongoConnected && db) {
      const result = await db.collection("users").insertOne(newUser);
      savedUserId = result.insertedId.toString();
    } else {
      const users = readLocalFile(usersFilePath, defaultUsers);
      savedUserId = new ObjectId().toString();
      users.push({ ...newUser, _id: savedUserId });
      writeLocalFile(usersFilePath, users);
    }

    // Auto-seed starter tasks for the new student
    const starterTasks = [
      {
        userId: savedUserId,
        title: "Setup SIT Nagpur Semester 5 Coursework",
        subject: "Full-Stack Web Dev (Flexi Credit)",
        courseCode: "SIT-CA3",
        type: "Project Milestone",
        priority: "High",
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        dueTime: "18:00",
        estimatedHours: 2,
        progress: 50,
        notes: "Welcome to CampusPulse at SIT Nagpur! Explore the coursework manager and submit lab deliverables.",
        subtasks: [
          { id: "1", title: "Complete profile registration", completed: true },
          { id: "2", title: "Review Continuous Assessment CA3 syllabus", completed: false },
          { id: "3", title: "Connect MongoDB Compass database", completed: false }
        ],
        done: false,
        createdAt: new Date()
      }
    ];

    if (isMongoConnected && db) {
      await db.collection("todos").insertMany(starterTasks);
    } else {
      const tasks = readLocalFile(todosFilePath, initialAcademicTodos);
      starterTasks.forEach(st => tasks.unshift({ ...st, _id: new ObjectId().toString() }));
      writeLocalFile(todosFilePath, tasks);
    }

    const token = `sit_token_${Date.now()}_${savedUserId}`;
    const userSafe = { ...newUser, _id: savedUserId };
    delete userSafe.password;

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      user: userSafe,
      token
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrPrn, password } = req.body;

    if (!emailOrPrn || !password) {
      return res.status(400).json({ error: "Please provide Email/PRN and password" });
    }

    const query = emailOrPrn.trim().toLowerCase();

    let user = null;
    if (isMongoConnected && db) {
      user = await db.collection("users").findOne({
        $or: [
          { email: query },
          { prn: emailOrPrn.trim() }
        ]
      });
    } else {
      const users = readLocalFile(usersFilePath, defaultUsers);
      user = users.find(u => 
        u.email.toLowerCase() === query || 
        (u.prn && u.prn.toLowerCase() === query)
      );
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid Email/PRN or password. Please try again." });
    }

    const token = `sit_token_${Date.now()}_${user._id}`;
    const userSafe = { ...user };
    delete userSafe.password;

    res.json({
      success: true,
      message: "Login successful! Welcome to SIT Nagpur CampusPulse.",
      user: userSafe,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const parts = token.split("_");
    const userId = parts[parts.length - 1];

    let user = null;
    if (isMongoConnected && db) {
      try {
        user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
      } catch (e) {
        user = await db.collection("users").findOne({ _id: userId });
      }
    } else {
      const users = readLocalFile(usersFilePath, defaultUsers);
      user = users.find(u => String(u._id) === String(userId));
    }

    if (!user) {
      return res.status(404).json({ error: "User session expired" });
    }

    const userSafe = { ...user };
    delete userSafe.password;
    res.json(userSafe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Todos / Academic Tasks Routes
// -------------------------------------------------------------

// GET /getall and GET /api/tasks
const getAllTasksHandler = async (req, res) => {
  try {
    const { search, filter, priority, subject, sort, userId } = req.query;

    let tasks = [];
    if (isMongoConnected && db) {
      const findQuery = userId ? { $or: [{ userId: userId }, { userId: { $exists: false } }] } : {};
      tasks = await db.collection("todos").find(findQuery).sort({ createdAt: -1 }).toArray();
    } else {
      tasks = readLocalFile(todosFilePath, initialAcademicTodos);
      if (userId) {
        tasks = tasks.filter(t => !t.userId || String(t.userId) === String(userId));
      }
    }

    // Filter by Done/Pending status
    if (filter === "Done") {
      tasks = tasks.filter(t => t.done);
    } else if (filter === "Pending") {
      tasks = tasks.filter(t => !t.done);
    }

    // Filter by Priority
    if (priority && priority !== "All") {
      tasks = tasks.filter(t => t.priority === priority);
    }

    // Filter by Subject
    if (subject && subject !== "All") {
      tasks = tasks.filter(t => t.subject === subject);
    }

    // Search query
    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      tasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.courseCode && t.courseCode.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === "dueDate") {
      tasks.sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
    } else if (sort === "priority") {
      const pMap = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      tasks.sort((a, b) => (pMap[b.priority] || 0) - (pMap[a.priority] || 0));
    } else if (sort === "title") {
      tasks.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }

    res.json(tasks);
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    res.status(500).json({ error: error.message });
  }
};

app.get("/getall", getAllTasksHandler);
app.get("/api/tasks", getAllTasksHandler);

// GET /get/:id and GET /api/tasks/:id
const getTaskByIdHandler = async (req, res) => {
  try {
    const id = req.params.id;

    if (isMongoConnected && db) {
      let query;
      try {
        query = { _id: new ObjectId(id) };
      } catch (e) {
        query = { _id: id };
      }
      const task = await db.collection("todos").findOne(query);
      if (task) return res.json(task);
    } else {
      const tasks = readLocalFile(todosFilePath, initialAcademicTodos);
      const task = tasks.find(t => String(t._id) === String(id));
      if (task) return res.json(task);
    }

    res.status(404).json({ msg: "Task not found" });
  } catch (error) {
    console.error("Error in getTaskById:", error);
    res.status(500).json({ error: error.message });
  }
};

app.get("/get/:id", getTaskByIdHandler);
app.get("/api/tasks/:id", getTaskByIdHandler);

// POST /create and POST /api/tasks
const createTaskHandler = async (req, res) => {
  try {
    const {
      title,
      subject,
      courseCode,
      type,
      priority,
      dueDate,
      dueTime,
      estimatedHours,
      notes,
      subtasks,
      progress,
      userId
    } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ error: "Task title is required" });
    }

    const newTask = {
      userId: userId || "",
      title: title.trim(),
      subject: subject || "General Academic",
      courseCode: courseCode || "SIT101",
      type: type || "Assignment",
      priority: priority || "Medium",
      dueDate: dueDate || "",
      dueTime: dueTime || "23:59",
      estimatedHours: Number(estimatedHours) || 2,
      progress: Number(progress) || 0,
      notes: notes || "",
      subtasks: Array.isArray(subtasks) ? subtasks : [],
      done: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (isMongoConnected && db) {
      const result = await db.collection("todos").insertOne(newTask);
      return res.status(201).json({ ...newTask, _id: result.insertedId });
    } else {
      const tasks = readLocalFile(todosFilePath, initialAcademicTodos);
      const generatedId = new ObjectId().toString();
      const taskToSave = { ...newTask, _id: generatedId };
      tasks.unshift(taskToSave);
      writeLocalFile(todosFilePath, tasks);
      return res.status(201).json(taskToSave);
    }
  } catch (error) {
    console.error("Error in createTask:", error);
    res.status(500).json({ error: error.message });
  }
};

app.post("/create", createTaskHandler);
app.post("/api/tasks", createTaskHandler);

// PUT /update/:id and PUT /api/tasks/:id
const updateTaskHandler = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      done,
      priority,
      dueDate,
      dueTime,
      subject,
      courseCode,
      type,
      notes,
      subtasks,
      progress,
      estimatedHours
    } = req.body;

    const changes = { updatedAt: new Date() };
    if (title !== undefined) changes.title = title;
    if (done !== undefined) changes.done = Boolean(done);
    if (priority !== undefined) changes.priority = priority;
    if (dueDate !== undefined) changes.dueDate = dueDate;
    if (dueTime !== undefined) changes.dueTime = dueTime;
    if (subject !== undefined) changes.subject = subject;
    if (courseCode !== undefined) changes.courseCode = courseCode;
    if (type !== undefined) changes.type = type;
    if (notes !== undefined) changes.notes = notes;
    if (subtasks !== undefined) changes.subtasks = subtasks;
    if (progress !== undefined) changes.progress = Number(progress);
    if (estimatedHours !== undefined) changes.estimatedHours = Number(estimatedHours);

    if (done === true) {
      changes.progress = 100;
    }

    if (isMongoConnected && db) {
      let query;
      try {
        query = { _id: new ObjectId(id) };
      } catch (e) {
        query = { _id: id };
      }
      const result = await db.collection("todos").updateOne(query, { $set: changes });
      return res.json({ success: true, result });
    } else {
      const tasks = readLocalFile(todosFilePath, initialAcademicTodos);
      const index = tasks.findIndex(t => String(t._id) === String(id));
      if (index === -1) {
        return res.status(404).json({ msg: "Task not found" });
      }
      tasks[index] = { ...tasks[index], ...changes };
      writeLocalFile(todosFilePath, tasks);
      return res.json({ success: true, updated: tasks[index] });
    }
  } catch (error) {
    console.error("Error in updateTask:", error);
    res.status(500).json({ error: error.message });
  }
};

app.put("/update/:id", updateTaskHandler);
app.put("/api/tasks/:id", updateTaskHandler);

// POST /api/tasks/:id/toggle
app.post("/api/tasks/:id/toggle", async (req, res) => {
  try {
    const id = req.params.id;
    let currentTask = null;

    if (isMongoConnected && db) {
      let query;
      try { query = { _id: new ObjectId(id) }; } catch (e) { query = { _id: id }; }
      currentTask = await db.collection("todos").findOne(query);
      if (!currentTask) return res.status(404).json({ msg: "Task not found" });

      const newDone = !currentTask.done;
      await db.collection("todos").updateOne(query, {
        $set: {
          done: newDone,
          progress: newDone ? 100 : (currentTask.progress === 100 ? 50 : currentTask.progress),
          updatedAt: new Date()
        }
      });
      return res.json({ success: true, done: newDone });
    } else {
      const tasks = readLocalFile(todosFilePath, initialAcademicTodos);
      const index = tasks.findIndex(t => String(t._id) === String(id));
      if (index === -1) return res.status(404).json({ msg: "Task not found" });

      const newDone = !tasks[index].done;
      tasks[index].done = newDone;
      tasks[index].progress = newDone ? 100 : (tasks[index].progress === 100 ? 50 : tasks[index].progress);
      tasks[index].updatedAt = new Date();
      writeLocalFile(todosFilePath, tasks);
      return res.json({ success: true, done: newDone, task: tasks[index] });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /delete/:id and DELETE /api/tasks/:id
const deleteTaskHandler = async (req, res) => {
  try {
    const id = req.params.id;

    if (isMongoConnected && db) {
      let query;
      try {
        query = { _id: new ObjectId(id) };
      } catch (e) {
        query = { _id: id };
      }
      const result = await db.collection("todos").deleteOne(query);
      return res.json({ success: true, result });
    } else {
      let tasks = readLocalFile(todosFilePath, initialAcademicTodos);
      tasks = tasks.filter(t => String(t._id) !== String(id));
      writeLocalFile(todosFilePath, tasks);
      return res.json({ success: true });
    }
  } catch (error) {
    console.error("Error in deleteTask:", error);
    res.status(500).json({ error: error.message });
  }
};

app.delete("/delete/:id", deleteTaskHandler);
app.delete("/api/tasks/:id", deleteTaskHandler);

// POST /api/tasks/seed
app.post("/api/tasks/seed", async (req, res) => {
  try {
    if (isMongoConnected && db) {
      await db.collection("todos").deleteMany({});
      await db.collection("todos").insertMany(initialAcademicTodos);
    } else {
      writeLocalFile(todosFilePath, initialAcademicTodos);
    }
    res.json({ success: true, message: "SIT Nagpur academic coursework re-seeded successfully!", count: initialAcademicTodos.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats
app.get("/api/stats", async (req, res) => {
  try {
    const { userId } = req.query;
    let tasks = [];
    if (isMongoConnected && db) {
      const q = userId ? { $or: [{ userId: userId }, { userId: { $exists: false } }] } : {};
      tasks = await db.collection("todos").find(q).toArray();
    } else {
      tasks = readLocalFile(todosFilePath, initialAcademicTodos);
      if (userId) {
        tasks = tasks.filter(t => !t.userId || String(t.userId) === String(userId));
      }
    }

    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pending = total - done;
    const urgent = tasks.filter(t => !t.done && t.priority === "Urgent").length;
    const high = tasks.filter(t => !t.done && t.priority === "High").length;
    const medium = tasks.filter(t => !t.done && t.priority === "Medium").length;
    const low = tasks.filter(t => !t.done && t.priority === "Low").length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    const todayStr = new Date().toISOString().slice(0, 10);
    const dueToday = tasks.filter(t => !t.done && t.dueDate === todayStr).length;
    const overdue = tasks.filter(t => !t.done && t.dueDate && t.dueDate < todayStr).length;

    const subjectMap = {};
    tasks.forEach(t => {
      const s = t.subject || "General";
      subjectMap[s] = (subjectMap[s] || 0) + 1;
    });

    res.json({
      total,
      done,
      pending,
      urgent,
      high,
      medium,
      low,
      percent,
      dueToday,
      overdue,
      subjects: subjectMap
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Contact & Helpdesk Messages Routes
// -------------------------------------------------------------

// GET /messages and GET /api/messages
const getMessagesHandler = async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const messages = await db.collection("messages").find().sort({ createdAt: -1 }).toArray();
      return res.json(messages);
    } else {
      const messages = readLocalFile(messagesFilePath, []);
      return res.json(messages);
    }
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ error: error.message });
  }
};

app.get("/messages", getMessagesHandler);
app.get("/api/messages", getMessagesHandler);

// POST /contact and POST /api/messages
const postContactHandler = async (req, res) => {
  try {
    const { name, rollNo, email, subject, category, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const newMessage = {
      name: name.trim(),
      rollNo: (rollNo || "").trim(),
      email: email.trim(),
      category: category || "General Query",
      subject: subject || "Academic Inquiry",
      message: message.trim(),
      college: "Symbiosis Institute of Technology (SIT), Nagpur",
      status: "Pending",
      createdAt: new Date()
    };

    if (isMongoConnected && db) {
      const result = await db.collection("messages").insertOne(newMessage);
      return res.status(201).json({ ...newMessage, _id: result.insertedId });
    } else {
      const messages = readLocalFile(messagesFilePath, []);
      const generatedId = new ObjectId().toString();
      const messageToSave = { ...newMessage, _id: generatedId };
      messages.unshift(messageToSave);
      writeLocalFile(messagesFilePath, messages);
      return res.status(201).json(messageToSave);
    }
  } catch (error) {
    console.error("Error in postContact:", error);
    res.status(500).json({ error: error.message });
  }
};

app.post("/contact", postContactHandler);
app.post("/api/messages", postContactHandler);

// DELETE /messages/:id and DELETE /api/messages/:id
const deleteMessageHandler = async (req, res) => {
  try {
    const id = req.params.id;

    if (isMongoConnected && db) {
      let query;
      try {
        query = { _id: new ObjectId(id) };
      } catch (e) {
        query = { _id: id };
      }
      const result = await db.collection("messages").deleteOne(query);
      return res.json({ success: true, result });
    } else {
      let messages = readLocalFile(messagesFilePath, []);
      messages = messages.filter(m => String(m._id) !== String(id));
      writeLocalFile(messagesFilePath, messages);
      return res.json({ success: true });
    }
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    res.status(500).json({ error: error.message });
  }
};

app.delete("/messages/:id", deleteMessageHandler);
app.delete("/api/messages/:id", deleteMessageHandler);

// -------------------------------------------------------------
// Start Server
// -------------------------------------------------------------
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` CampusPulse Server (SIT Nagpur) running on port ${PORT}`);
    console.log(` Mode: ${isMongoConnected ? 'MongoDB (Compass Connected)' : 'Local File Store (Compass URI pending)'}`);
    console.log(`====================================================`);
  });
});
