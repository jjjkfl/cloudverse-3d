const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const multer = require('multer');
const mysql = require('mysql2/promise');

const app = express();
const upload = multer();

let db;

// Initialize MySQL Database
(async () => {
    try {
        const dbName = process.env.DB_NAME || 'cloudverse';
        const dbPort = Number(process.env.DB_PORT || 3306);

        // Safely attempt to create the database (fails gracefully if restricted in production)
        try {
            const connection = await mysql.createConnection({
                host: process.env.DB_HOST || '127.0.0.1',
                port: dbPort,
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || ''
            });
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
            await connection.end();
            console.log(`✅ Verified database '${dbName}' exists.`);
        } catch (dbCreateError) {
            console.log(`⚠️ Skipped database creation: Assumed it already exists or user lacks permissions (common in production).`);
        }

        // Create a connection pool to the database
        db = mysql.createPool({
            host: process.env.DB_HOST || '127.0.0.1',
            port: dbPort,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Ensure the contacts table is there
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                company VARCHAR(255),
                phone VARCHAR(50),
                service VARCHAR(100),
                subject VARCHAR(255),
                message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        await db.query(createTableQuery);
        console.log('✅ MySQL Database configured and connected.');
    } catch (e) {
        console.error('Error opening database:', e);
    }
})();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS  // 16-character App Password from Gmail
    }
});

// API endpoint to handle form submission
app.post('/submit-form', upload.none(), async (req, res) => {
    console.log(`\n[SERVER] Received POST request at /submit-form from ${req.ip}`);
    console.log(`[SERVER] Request body fields received:`, Object.keys(req.body));
    console.log(`[SERVER] Data:`, req.body);
    
    try {
        const { firstName, lastName, name, email, company, service, message, subject, phone, source } = req.body;

        let clientName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown Sender';
        let emailSubject = subject || `New Website Form Submission from ${clientName}`;

        // Validate crucial fields before sending
        if (!email || !message) {
            console.warn('[SERVER] Rejected: Missing email or message field.');
            return res.status(400).json({ success: false, message: 'Email and message are required.' });
        }

        console.log(`[SERVER] All data valid. Executing MySQL insertion for: ${email}`);
        
        // 1. Store the Submission directly in the MySQL Database
        await db.execute(
            `INSERT INTO contacts (name, email, company, phone, service, subject, message) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [clientName, email, company || 'N/A', phone || 'N/A', service || 'N/A', emailSubject, message]
        );
        
        console.log(`[SERVER] MySQL insertion successful.`);

        // 2. Respond immediately to the frontend to prevent timeout or crash errors
        res.status(200).json({ success: true, message: 'Message sent and saved successfully!' });

        // 3. Background Email Notification (Don't let it crash the server)
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER || 'lwithtarun@gmail.com', // Target email (owner)
            subject: emailSubject,
            text: `
                Name: ${clientName}
                Email: ${email}
                Company: ${company || 'N/A'}
                Phone: ${phone || 'N/A'}
                Service Interested: ${service || 'N/A'}
                
                Message:
                ${message}
            `
        };

        // Fire and forget email with error logging
        transporter.sendMail(mailOptions).then(info => {
            console.log('[MAIL] Notification email sent successfully.');
        }).catch(emailErr => {
            console.error('[MAIL ERROR] Notification email failed (but data is in DB):', emailErr.message);
        });

    } catch (error) {
        console.error('[SERVER ERROR] Form submission process failed:', error);
        // Only attempt to send res if it hasn't been sent already
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Failed to process message: ' + error.message });
        }
    }
});

// API Endpoint for Admin to Fetch Contacts
app.post('/api/admin/contacts', async (req, res) => {
    try {
        const secretKey = req.body.key;
        if (secretKey !== (process.env.ADMIN_KEY || 'secret123')) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }

        const [contacts] = await db.query('SELECT * FROM contacts ORDER BY timestamp DESC');
        return res.status(200).json({ success: true, contacts });
    } catch (error) {
        console.error('Database Admin View error:', error);
        return res.status(500).json({ success: false, message: 'Failed to load contacts from the database.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server is running at http://localhost:${PORT}`);
    console.log(`✉️ Make sure to set EMAIL_USER and EMAIL_PASS in your .env file!`);
});
