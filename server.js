const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const multer = require('multer');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const upload = multer();

let db;

// Initialize SQLite Database
(async () => {
    try {
        db = await open({
            filename: path.join(__dirname, 'database.sqlite'),
            driver: sqlite3.Database
        });

        // Ensure the contacts table is there
        await db.exec(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                company TEXT,
                phone TEXT,
                service TEXT,
                subject TEXT,
                message TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ SQLite Database configured and connected.');
    } catch (e) {
        console.error('Error opening database', e);
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
    try {
        const { firstName, lastName, name, email, company, service, message, subject, phone } = req.body;

        let clientName = name || `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown Sender';
        let emailSubject = subject || `New Website Form Submission from ${clientName}`;

        // Validate crucial fields before sending
        if (!email || !message) {
            return res.status(400).json({ success: false, message: 'Email and message are required.' });
        }

        // 1. Store the Submission directly in the Local SQLite Database
        await db.run(
            `INSERT INTO contacts (name, email, company, phone, service, subject, message) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [clientName, email, company || 'N/A', phone || 'N/A', service || 'N/A', emailSubject, message]
        );
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'info@cloudversesolution.com', // Target email
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

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Email error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
});

// Admin Route to View Saved Contacts
app.get('/view-contacts', async (req, res) => {
    try {
        const secretKey = req.query.key;
        if (secretKey !== (process.env.ADMIN_KEY || 'secret123')) {
            return res.status(401).send('Unauthorized. Please provide the correct ?key= URL parameter.');
        }

        const contacts = await db.all('SELECT * FROM contacts ORDER BY timestamp DESC');

        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin - View Contacts</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; background-color: #f7f9fc; color: #333; }
                    h1 { color: #1e293b; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden; }
                    th, td { padding: 15px; text-align: left; border-bottom: 1px solid #e2e8f0; }
                    th { background-color: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 13px; }
                    tr:hover { background-color: #f1f5f9; }
                    .timestamp { color: #64748b; font-size: 0.9em; }
                    .msg-cell { max-width: 300px; white-space: pre-wrap; word-wrap: break-word; font-size: 0.9em; line-height: 1.4; color: #475569; }
                </style>
            </head>
            <body>
                <h1>📫 Contact Form Submissions</h1>
                <p>Found <b>${contacts.length}</b> total messages saved in the SQLite database.</p>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Date</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Company</th>
                            <th>Service</th>
                            <th>Subject</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        contacts.forEach(c => {
            html += `
                <tr>
                    <td>#${c.id}</td>
                    <td class="timestamp">${new Date(c.timestamp).toLocaleString()}</td>
                    <td><b>${c.name}</b></td>
                    <td><a href="mailto:${c.email}">${c.email}</a></td>
                    <td>${c.phone}</td>
                    <td>${c.company}</td>
                    <td>${c.service}</td>
                    <td>${c.subject}</td>
                    <td class="msg-cell">${c.message}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        res.send(html);
    } catch (error) {
        console.error('Database Admin View error:', error);
        res.status(500).send('Failed to load contacts from Database.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server is running at http://localhost:${PORT}`);
    console.log(`✉️ Make sure to set EMAIL_USER and EMAIL_PASS in your .env file!`);
});
