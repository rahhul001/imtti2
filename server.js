// server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Database connection
const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ssl: {
        rejectUnauthorized: false
    }
};

let pool;

async function initDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('✅ Database connected successfully');

        // Create tables if they don't exist
        await createTables();
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        console.log('⚠️ Running without database - using localStorage fallback');
    }
}

async function createTables() {
    const createTablesSQL = `
        CREATE TABLE IF NOT EXISTS centers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            location VARCHAR(255),
            contact_person VARCHAR(255),
            phone VARCHAR(20),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP  
        );

        CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255),
            phone VARCHAR(20),
            date_of_birth DATE,
            center_id INT,
            photo TEXT,
            registration_id VARCHAR(50) UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
            FOREIGN KEY (center_id) REFERENCES centers(id)
        );

        CREATE TABLE IF NOT EXISTS applications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            application_number VARCHAR(50) UNIQUE NOT NULL,
            student_id INT,
            center_id INT,
            data JSON,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (center_id) REFERENCES centers(id)
        );

        CREATE TABLE IF NOT EXISTS marks (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT,
            subject VARCHAR(255) NOT NULL,
            marks INT,
            grade VARCHAR(10),
            center_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (center_id) REFERENCES centers(id)
        );

        CREATE TABLE IF NOT EXISTS admins (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        INSERT IGNORE INTO admins (name, email, password)
        VALUES ('IMTTI Administrator', 'admin@imtti.com', 'admin123');
    `;

    try {
        await pool.execute(createTablesSQL);
        console.log('✅ Database tables created successfully');
    } catch (error) {
        console.error('❌ Error creating tables:', error);
    }
}

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'IMTTI Server is running!', 
        status: 'success',
        database: pool ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        message: 'Server is running properly',
        database: pool ? 'connected' : 'disconnected'
    });
});

// API Routes

// Centers
app.get('/api/centers', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const [rows] = await pool.execute('SELECT * FROM centers ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/centers', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const { name, email, password, location, contact_person, phone } = req.body;    
        const [result] = await pool.execute(
            'INSERT INTO centers (name, email, password, location, contact_person, phone) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, password, location, contact_person, phone]
        );
        res.json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Students
app.get('/api/students', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const [rows] = await pool.execute('SELECT * FROM students ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/students', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const { name, email, phone, date_of_birth, center_id, photo, registration_id } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO students (name, email, phone, date_of_birth, center_id, photo, registration_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, date_of_birth, center_id, photo, registration_id]      
        );
        res.json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Applications
app.get('/api/applications', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const [rows] = await pool.execute('SELECT * FROM applications ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/applications', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const { application_number, student_id, center_id, data, status } = req.body;   
        const [result] = await pool.execute(
            'INSERT INTO applications (application_number, student_id, center_id, data, status) VALUES (?, ?, ?, ?, ?)',
            [application_number, student_id, center_id, JSON.stringify(data), status || 'pending']
        );
        res.json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Marks
app.get('/api/marks', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const [rows] = await pool.execute('SELECT * FROM marks ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/marks', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const { student_id, subject, marks, grade, center_id } = req.body;
        const [result] = await pool.execute(
            'INSERT INTO marks (student_id, subject, marks, grade, center_id) VALUES (?, ?, ?, ?, ?)',
            [student_id, subject, marks, grade, center_id]
        );
        res.json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admins
app.get('/api/admins', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const [rows] = await pool.execute('SELECT * FROM admins');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Authentication
app.post('/api/auth/admin', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const { email, password } = req.body;
        const [rows] = await pool.execute(
            'SELECT * FROM admins WHERE email = ? AND password = ?',
            [email, password]
        );
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });   
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/center', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const { email, password } = req.body;
        const [rows] = await pool.execute(
            'SELECT * FROM centers WHERE email = ? AND password = ? AND is_active = true',
            [email, password]
        );
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });   
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/student', async (req, res) => {
    try {
        if (!pool) {
            return res.status(503).json({ error: 'Database not connected' });
        }
        const { registration_id, date_of_birth } = req.body;
        const [rows] = await pool.execute(
            'SELECT * FROM students WHERE registration_id = ? AND date_of_birth = ?',   
            [registration_id, date_of_birth]
        );
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });   
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database and start server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 IMTTI Server running on port ${PORT}`);
        console.log(`📱 Website: https://imtti1-production.up.railway.app/`);
    });
});