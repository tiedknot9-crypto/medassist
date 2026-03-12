import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("hospital.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    specialization TEXT,
    department_id INTEGER,
    availability TEXT,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    name TEXT,
    mobile TEXT,
    age INTEGER,
    gender TEXT
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT,
    doctor_id INTEGER,
    date TEXT,
    time TEXT,
    status TEXT DEFAULT 'confirmed',
    token_no TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    test_name TEXT,
    status TEXT,
    result_url TEXT,
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS knowledge_base (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT,
    keywords TEXT,
    answer TEXT,
    department_id INTEGER,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT,
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    status TEXT DEFAULT 'active', -- active, closed, human_escalated
    agent_id TEXT, -- staff name or id
    FOREIGN KEY(patient_id) REFERENCES patients(id)
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    sender TEXT, -- patient, ai, staff
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    message_type TEXT DEFAULT 'text',
    FOREIGN KEY(session_id) REFERENCES chat_sessions(session_id)
  );
`);

// Seed Data
const seed = () => {
  const deptCount = db.prepare("SELECT COUNT(*) as count FROM departments").get() as any;
  if (deptCount.count === 0) {
    const depts = ["Cardiology", "Orthopedic", "ENT", "General Medicine"];
    const insertDept = db.prepare("INSERT INTO departments (name) VALUES (?)");
    depts.forEach(d => insertDept.run(d));

    const doctors = [
      { name: "Dr. Sameer Sharma", spec: "Senior Cardiologist", dept: "Cardiology", avail: "Mon-Fri, 10:00 AM - 4:00 PM" },
      { name: "Dr. Ananya Iyer", spec: "Orthopedic Surgeon", dept: "Orthopedic", avail: "Tue-Sat, 11:00 AM - 5:00 PM" },
      { name: "Dr. Rahul Verma", spec: "ENT Specialist", dept: "ENT", avail: "Mon-Thu, 9:00 AM - 1:00 PM" },
      { name: "Dr. Priya Singh", spec: "General Physician", dept: "General Medicine", avail: "Daily, 8:00 AM - 8:00 PM" },
      { name: "Dr. Vikram Malhotra", spec: "Neurologist", dept: "Neurology", avail: "Mon, Wed, Fri, 2:00 PM - 6:00 PM" },
      { name: "Dr. Sneha Kapoor", spec: "Pediatrician", dept: "Pediatrics", avail: "Daily, 10:00 AM - 2:00 PM" },
      { name: "Dr. Amit Trivedi", spec: "Dermatologist", dept: "Dermatology", avail: "Tue, Thu, Sat, 4:00 PM - 8:00 PM" }
    ];

    doctors.forEach(doc => {
      const dept = db.prepare("SELECT id FROM departments WHERE name = ?").get(doc.dept) as any;
      db.prepare("INSERT INTO doctors (name, specialization, department_id, availability) VALUES (?, ?, ?, ?)")
        .run(doc.name, doc.spec, dept.id, doc.avail);
    });

    db.prepare("INSERT INTO patients (id, name, mobile, age, gender) VALUES (?, ?, ?, ?, ?)")
      .run("P10234", "Rahul Sharma", "9876543210", 35, "Male");
    db.prepare("INSERT INTO patients (id, name, mobile, age, gender) VALUES (?, ?, ?, ?, ?)")
      .run("P10235", "Sita Devi", "8765432109", 28, "Female");
    db.prepare("INSERT INTO patients (id, name, mobile, age, gender) VALUES (?, ?, ?, ?, ?)")
      .run("P10236", "Amit Patel", "7654321098", 42, "Male");

    db.prepare("INSERT INTO reports (id, patient_id, test_name, status, result_url) VALUES (?, ?, ?, ?, ?)")
      .run("R999", "P10234", "Blood Sugar", "Ready", "https://example.com/report.pdf");
    db.prepare("INSERT INTO reports (id, patient_id, test_name, status, result_url) VALUES (?, ?, ?, ?, ?)")
      .run("R1000", "P10235", "Thyroid Profile", "Pending", "");

    const services = [
      { name: "General Consultation", desc: "Standard checkup with a general physician.", price: 500 },
      { name: "Cardiology Screening", desc: "Comprehensive heart health assessment including ECG.", price: 2500 },
      { name: "X-Ray (Chest)", desc: "High-resolution digital X-ray imaging.", price: 800 },
      { name: "Blood Test (Full Profile)", desc: "Complete blood count and metabolic panel.", price: 1500 },
      { name: "MRI Scan", desc: "Advanced magnetic resonance imaging for detailed diagnosis.", price: 6000 },
      { name: "Physiotherapy Session", desc: "Expert physical therapy for recovery and pain management.", price: 1200 },
      { name: "Dental Cleaning", desc: "Professional scaling and polishing for oral hygiene.", price: 1000 }
    ];
    const insertService = db.prepare("INSERT INTO services (name, description, price) VALUES (?, ?, ?)");
    services.forEach(s => insertService.run(s.name, s.desc, s.price));

    db.prepare("INSERT INTO appointments (patient_id, doctor_id, date, time, status) VALUES (?, ?, ?, ?, ?)")
      .run("P10234", 1, "2026-03-15", "10:30 AM", "confirmed");
    db.prepare("INSERT INTO appointments (patient_id, doctor_id, date, time, status) VALUES (?, ?, ?, ?, ?)")
      .run("P10235", 2, "2026-03-16", "11:00 AM", "pending");
  }

  // Check if additional dummy data is needed
  const patientCount = db.prepare("SELECT COUNT(*) as count FROM patients WHERE id = 'P10235'").get() as any;
  if (patientCount.count === 0) {
    // Seed Knowledge Base
    const kb = [
      { q: "What are OPD charges?", k: "opd, charges, fees", a: "OPD consultation charge is ₹300", d: "General Medicine" },
      { q: "How to book appointment?", k: "book, appointment, schedule", a: "You can book an appointment via our website portal or by calling +91 522 1234 567", d: "General Medicine" },
      { q: "Do you have emergency services?", k: "emergency, 24/7, urgent", a: "Yes, we have a 24/7 emergency department equipped with advanced life support.", d: "General Medicine" },
      { q: "What are the visiting hours?", k: "visiting, hours, time", a: "Visiting hours are from 4 PM to 7 PM daily.", d: "General Medicine" },
      { q: "Do you accept insurance?", k: "insurance, cashless, tpa", a: "Yes, we accept all major insurance providers and offer cashless facilities.", d: "General Medicine" },
      { q: "Where is the pharmacy located?", k: "pharmacy, medicine, chemist", a: "The pharmacy is located on the ground floor near the main entrance.", d: "General Medicine" },
      { q: "What are the lab timings?", k: "lab, timing, blood test", a: "The laboratory is open from 7 AM to 8 PM for sample collection.", d: "General Medicine" },
      { q: "How can I get my reports?", k: "reports, download, online", a: "You can view and download your reports from the Patient Portal or via our AI assistant by providing your Patient ID.", d: "General Medicine" },
      { q: "Is there a cafeteria?", k: "food, cafeteria, canteen", a: "Yes, the cafeteria is located on the 2nd floor and is open from 7 AM to 10 PM.", d: "General Medicine" }
    ];
    
    // Clear existing KB to avoid duplicates if re-running
    db.prepare("DELETE FROM knowledge_base").run();
    
    kb.forEach(item => {
      const dept = db.prepare("SELECT id FROM departments WHERE name = ?").get(item.d) as any;
      if (dept) {
        db.prepare("INSERT INTO knowledge_base (question, keywords, answer, department_id) VALUES (?, ?, ?, ?)")
          .run(item.q, item.k, item.a, dept.id);
      }
    });

    // Seed Patients
    db.prepare("INSERT INTO patients (id, name, mobile, age, gender) VALUES (?, ?, ?, ?, ?)")
      .run("P10235", "Anjali Verma", "9988776655", 28, "Female");

    // Seed some chats
    const chatData = [
      { pid: "P10234", status: "human_escalated", msg: "I need to talk to a human about my report." },
      { pid: "P10235", status: "active", msg: "Can I book an appointment for tomorrow?" },
      { pid: "P10234", status: "closed", msg: "Thank you for the help." },
      { pid: "P10235", status: "active", msg: "What are the charges for X-Ray?" },
      { pid: "P10234", status: "human_escalated", msg: "My chest pain is increasing." },
      { pid: "P10235", status: "active", msg: "Is Dr. Sharma available today?" },
      { pid: "P10234", status: "closed", msg: "I have received my reports." }
    ];

    // Clear existing chats to avoid duplicates
    db.prepare("DELETE FROM chat_messages").run();
    db.prepare("DELETE FROM chat_sessions").run();

    chatData.forEach((chat, index) => {
      const sessionId = index + 1;
      db.prepare("INSERT INTO chat_sessions (session_id, patient_id, status) VALUES (?, ?, ?)").run(sessionId, chat.pid, chat.status);
      db.prepare("INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)")
        .run(sessionId, "patient", chat.msg);
      if (chat.status === "human_escalated") {
        db.prepare("INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)")
          .run(sessionId, "ai", "I am escalating your request to our staff. Please wait.");
      } else if (chat.status === "closed") {
        db.prepare("INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)")
          .run(sessionId, "ai", "You're welcome! Have a great day.");
      } else {
        db.prepare("INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)")
          .run(sessionId, "ai", "Hello! How can I assist you today?");
      }
    });
  }
};
seed();

async function startServer() {
  const app = express();
  app.use(express.json());

  // HMS APIs
  app.get("/api/hospital/departments", (req, res) => {
    const depts = db.prepare("SELECT name FROM departments").all();
    res.json(depts.map((d: any) => d.name));
  });

  app.get("/api/doctors", (req, res) => {
    const { department } = req.query;
    let query = "SELECT d.id, d.name, d.specialization, dept.name as department, d.availability FROM doctors d JOIN departments dept ON d.department_id = dept.id";
    let params: any[] = [];
    if (department) {
      query += " WHERE dept.name = ?";
      params.push(department);
    }
    const doctors = db.prepare(query).all(...params);
    res.json(doctors);
  });

  app.get("/api/doctor/availability/:id", (req, res) => {
    const doctor = db.prepare("SELECT * FROM doctors WHERE id = ?").get(req.params.id) as any;
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json({
      doctor_id: doctor.id,
      available_today: true,
      time_slots: doctor.availability.split(", ")
    });
  });

  app.post("/api/appointment/book", (req, res) => {
    const { patient_id, doctor_id, date, time } = req.body;
    const token = "OPD-" + Math.floor(1000 + Math.random() * 9000);
    const result = db.prepare("INSERT INTO appointments (patient_id, doctor_id, date, time, token_no) VALUES (?, ?, ?, ?, ?)")
      .run(patient_id || "P10234", doctor_id, date, time, token);
    res.json({
      appointment_id: result.lastInsertRowid,
      token_no: token,
      status: "confirmed"
    });
  });

  app.get("/api/lab/report-status/:patient_id", (req, res) => {
    const reports = db.prepare("SELECT test_name, status, id as report_id FROM reports WHERE patient_id = ?").all(req.params.patient_id);
    res.json({ tests: reports });
  });

  app.get("/api/patient/verify", (req, res) => {
    const { mobile } = req.query;
    const patient = db.prepare("SELECT * FROM patients WHERE mobile = ?").get(mobile) as any;
    if (patient) {
      res.json(patient);
    } else {
      res.status(404).json({ error: "Patient not found" });
    }
  });

  // Admin & General APIs
  app.get("/api/services", (req, res) => {
    const services = db.prepare("SELECT * FROM services").all();
    res.json(services);
  });

  app.post("/api/admin/doctors", (req, res) => {
    const { name, specialization, department_id, availability } = req.body;
    const result = db.prepare("INSERT INTO doctors (name, specialization, department_id, availability) VALUES (?, ?, ?, ?)")
      .run(name, specialization, department_id, availability);
    res.json({ id: result.lastInsertRowid });
  });

  app.post("/api/admin/services", (req, res) => {
    const { name, description, price } = req.body;
    const result = db.prepare("INSERT INTO services (name, description, price) VALUES (?, ?, ?)")
      .run(name, description, price);
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/admin/appointments", (req, res) => {
    const appointments = db.prepare(`
      SELECT a.*, p.name as patient_name, d.name as doctor_name 
      FROM appointments a 
      JOIN patients p ON a.patient_id = p.id 
      JOIN doctors d ON a.doctor_id = d.id
    `).all();
    res.json(appointments);
  });

  app.get("/api/admin/reports", (req, res) => {
    const reports = db.prepare(`
      SELECT r.*, p.name as patient_name 
      FROM reports r 
      JOIN patients p ON r.patient_id = p.id
    `).all();
    res.json(reports);
  });

  // Knowledge Base APIs
  app.get("/api/admin/kb", (req, res) => {
    const kb = db.prepare(`
      SELECT k.*, d.name as department_name 
      FROM knowledge_base k 
      JOIN departments d ON k.department_id = d.id
    `).all();
    res.json(kb);
  });

  app.post("/api/admin/kb", (req, res) => {
    const { question, keywords, answer, department_id } = req.body;
    const result = db.prepare("INSERT INTO knowledge_base (question, keywords, answer, department_id) VALUES (?, ?, ?, ?)")
      .run(question, keywords, answer, department_id);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/admin/kb/:id", (req, res) => {
    const { question, keywords, answer, department_id } = req.body;
    db.prepare("UPDATE knowledge_base SET question = ?, keywords = ?, answer = ?, department_id = ? WHERE id = ?")
      .run(question, keywords, answer, department_id, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/kb/:id", (req, res) => {
    db.prepare("DELETE FROM knowledge_base WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Chat Monitoring APIs
  app.get("/api/admin/chats", (req, res) => {
    const chats = db.prepare(`
      SELECT c.*, p.name as patient_name, p.age, p.gender, p.mobile
      FROM chat_sessions c
      JOIN patients p ON c.patient_id = p.id
      ORDER BY c.start_time DESC
    `).all();
    res.json(chats);
  });

  app.get("/api/admin/chats/:id/messages", (req, res) => {
    const messages = db.prepare("SELECT * FROM chat_messages WHERE session_id = ? ORDER BY timestamp ASC").all(req.params.id);
    res.json(messages);
  });

  app.post("/api/admin/chats/:id/assign", (req, res) => {
    const { staff_name } = req.body;
    db.prepare("UPDATE chat_sessions SET agent_id = ?, status = 'active' WHERE session_id = ?").run(staff_name, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/chats/:id/close", (req, res) => {
    db.prepare("UPDATE chat_sessions SET status = 'closed', end_time = CURRENT_TIMESTAMP WHERE session_id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.post("/api/admin/chats/:id/message", (req, res) => {
    const { message, sender, message_type } = req.body;
    db.prepare("INSERT INTO chat_messages (session_id, sender, message, message_type) VALUES (?, ?, ?, ?)")
      .run(req.params.id, sender || "staff", message, message_type || 'text');
    res.json({ success: true });
  });

  // Chat Analytics API
  app.get("/api/admin/chat-analytics", (req, res) => {
    const totalChats = db.prepare("SELECT COUNT(*) as count FROM chat_sessions").get() as any;
    const humanEscalated = db.prepare("SELECT COUNT(*) as count FROM chat_sessions WHERE status = 'human_escalated'").get() as any;
    const closed = db.prepare("SELECT COUNT(*) as count FROM chat_sessions WHERE status = 'closed'").get() as any;
    
    // Mocking some data for the charts since we don't have enough history
    const dailyData = [
      { date: '2026-03-04', chats: 450 },
      { date: '2026-03-05', chats: 520 },
      { date: '2026-03-06', chats: 480 },
      { date: '2026-03-07', chats: 610 },
      { date: '2026-03-08', chats: 550 },
      { date: '2026-03-09', chats: 590 },
      { date: '2026-03-10', chats: totalChats.count }
    ];

    const deptQueries = db.prepare(`
      SELECT d.name as department, COUNT(k.id) as count 
      FROM departments d 
      LEFT JOIN knowledge_base k ON d.id = k.department_id 
      GROUP BY d.name
    `).all();

    res.json({
      metrics: {
        totalChats: 3200 + totalChats.count, // Adding some base number for "realism"
        aiSolved: 2600 + (totalChats.count - humanEscalated.count),
        humanEscalation: 600 + humanEscalated.count,
        satisfactionScore: 4.8
      },
      dailyChatGraph: dailyData,
      departmentQueries: deptQueries,
      topQueries: ["Appointment", "OPD Charges", "Report Status", "Emergency"]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
