const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const multer = require('multer');
const mysql = require('mysql2/promise');
const fs = require('fs');

const app = express();
const upload = multer();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Config Multer for Disk Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const diskUpload = multer({ storage: storage });


let db;
let dbType = 'mysql';

// Initialize Database
(async () => {
    const seedDefaultSettings = async () => {
        const defaults = {
            'youtube_auto_publish': 'true',
            'youtube_sync_enabled': 'true'
        };
        for (const [key, val] of Object.entries(defaults)) {
            const [rows] = await db.query('SELECT setting_value FROM admin_settings WHERE setting_key = ?', [key]);
            if (!rows || rows.length === 0) {
                await db.execute('INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?)', [key, val]);
            }
        }
    };

    try {
        const dbName = process.env.DB_NAME || 'cloudverse';
        const dbPort = Number(process.env.DB_PORT || 3306);
        const dbHost = process.env.DB_HOST || '127.0.0.1';
        const dbUser = process.env.DB_USER || 'root';
        const dbPassword = process.env.DB_PASSWORD || '';

        console.log('🔄 Attempting to connect to MySQL database...');
        
        // Safely attempt to create the database with a short timeout to fail fast
        try {
            const connection = await mysql.createConnection({
                host: dbHost,
                port: dbPort,
                user: dbUser,
                password: dbPassword,
                connectTimeout: 2000
            });
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
            await connection.end();
            console.log(`✅ Verified database '${dbName}' exists.`);
        } catch (dbCreateError) {
            if (dbCreateError.code === 'ECONNREFUSED' || dbCreateError.code === 'ETIMEDOUT') {
                throw dbCreateError;
            }
            console.log(`⚠️ Skipped database creation: Assumed it already exists or user lacks permissions.`);
        }

        // Create a connection pool to the database
        const pool = mysql.createPool({
            host: dbHost,
            port: dbPort,
            user: dbUser,
            password: dbPassword,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 2000
        });

        // Test database pool connection
        await pool.query('SELECT 1');

        db = pool;
        dbType = 'mysql';

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

        const createUpcomingTableQuery = `
            CREATE TABLE IF NOT EXISTS upcoming_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                category VARCHAR(100),
                media_type VARCHAR(50),
                media_url TEXT,
                gallery TEXT,
                release_date VARCHAR(100),
                status VARCHAR(50) DEFAULT 'published',
                scheduled_time DATETIME NULL,
                meta_title VARCHAR(255),
                meta_description TEXT,
                og_image TEXT,
                youtube_id VARCHAR(100),
                sort_order INT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await db.query(createUpcomingTableQuery);

        try {
            await db.query("ALTER TABLE upcoming_items ADD COLUMN gallery TEXT");
        } catch (alterError) {
            // Ignore if column already exists
        }

        const createSettingsTableQuery = `
            CREATE TABLE IF NOT EXISTS admin_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value TEXT
            )
        `;
        await db.query(createSettingsTableQuery);
        await seedDefaultSettings();

        console.log('✅ MySQL Database configured and connected.');
    } catch (e) {
        console.warn(`⚠️ MySQL connection failed (${e.message}). Falling back to local SQLite database...`);
        
        try {
            const sqlite3 = require('sqlite3').verbose();
            const sqliteDb = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

            // Promise-based adapter to match the mysql2 API structure
            db = {
                execute: (sql, params) => {
                    return new Promise((resolve, reject) => {
                        sqliteDb.run(sql, params, function (err) {
                            if (err) return reject(err);
                            resolve([{ insertId: this.lastID, changes: this.changes }]);
                        });
                    });
                },
                query: (sql, params) => {
                    return new Promise((resolve, reject) => {
                        sqliteDb.all(sql, params, (err, rows) => {
                            if (err) return reject(err);
                            resolve([rows]);
                        });
                    });
                }
            };
            dbType = 'sqlite';

            // Ensure the contacts table is there (using SQLite syntax)
            const createTableQuery = `
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
            `;
            await db.execute(createTableQuery);

            const createUpcomingTableQuery = `
                CREATE TABLE IF NOT EXISTS upcoming_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    category TEXT,
                    media_type TEXT,
                    media_url TEXT,
                    gallery TEXT,
                    release_date TEXT,
                    status TEXT DEFAULT 'published',
                    scheduled_time TEXT NULL,
                    meta_title TEXT,
                    meta_description TEXT,
                    og_image TEXT,
                    youtube_id TEXT,
                    sort_order INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;
            await db.execute(createUpcomingTableQuery);

            try {
                await db.execute("ALTER TABLE upcoming_items ADD COLUMN gallery TEXT");
            } catch (alterError) {
                // Ignore if column already exists
            }

            const createSettingsTableQuery = `
                CREATE TABLE IF NOT EXISTS admin_settings (
                    setting_key TEXT PRIMARY KEY,
                    setting_value TEXT
                )
            `;
            await db.execute(createSettingsTableQuery);
            await seedDefaultSettings();

            console.log('✅ Local SQLite Database configured and connected.');
        } catch (sqliteError) {
            console.error('❌ Failed to initialize local SQLite database:', sqliteError);
        }
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

// Admin email notifications helper
const sendAdminNotification = (action, details) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER || 'info@cloudversesolution.com',
        subject: `🚨 [Cloudverse Admin Alert] Post ${action}`,
        text: `
An action has been performed in the Cloudverse Admin Panel:

Action: ${action}
Timestamp: ${new Date().toLocaleString()}

Details:
${details}
        `
    };

    transporter.sendMail(mailOptions).then(info => {
        console.log(`[MAIL] Admin notification email sent for action: ${action}`);
    }).catch(err => {
        console.error(`[MAIL ERROR] Notification email failed for action ${action}:`, err.message);
    });
};

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
            to: process.env.EMAIL_USER || 'info@cloudversesolution.com', // Target email (owner)
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

// Helper function to verify admin key from headers, body, or query
const verifyAdminKey = (req) => {
    const key = req.headers['x-admin-key'] || req.query.key || (req.body && req.body.key);
    return key === (process.env.ADMIN_KEY || 'secret123');
};

// ADMIN API: Fetch All Contacts (For Admin Grid view)
app.post('/api/admin/contacts', async (req, res) => {
    try {
        if (!verifyAdminKey(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }
        const [contacts] = await db.query('SELECT * FROM contacts ORDER BY timestamp DESC');
        return res.status(200).json({ success: true, contacts });
    } catch (error) {
        console.error('Database Admin View error:', error);
        return res.status(500).json({ success: false, message: 'Failed to load contacts from the database.' });
    }
});

// PUBLIC API: Fetch Published / Active Upcoming Items
app.get('/api/upcoming', async (req, res) => {
    try {
        let queryStr;
        if (dbType === 'sqlite') {
            queryStr = `
                SELECT * FROM upcoming_items 
                WHERE status = 'published' 
                   OR (status = 'scheduled' AND datetime(scheduled_time) <= datetime('now', 'localtime'))
                ORDER BY sort_order ASC, created_at DESC
            `;
        } else {
            queryStr = `
                SELECT * FROM upcoming_items 
                WHERE status = 'published' 
                   OR (status = 'scheduled' AND scheduled_time <= NOW())
                ORDER BY sort_order ASC, created_at DESC
            `;
        }
        const [items] = await db.query(queryStr);
        res.status(200).json({ success: true, items });
    } catch (error) {
        console.error('Error fetching upcoming items:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming items.' });
    }
});

// ADMIN API: Fetch All Upcoming Items (For Admin Grid view)
app.post('/api/admin/upcoming/list', async (req, res) => {
    try {
        if (!verifyAdminKey(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }
        const [items] = await db.query('SELECT * FROM upcoming_items ORDER BY sort_order ASC, created_at DESC');
        return res.status(200).json({ success: true, items });
    } catch (error) {
        console.error('Admin Fetch upcoming error:', error);
        return res.status(500).json({ success: false, message: 'Failed to load upcoming items.' });
    }
});

// ADMIN API: Create Upcoming Item (handles multiple files & YouTube links)
app.post('/api/admin/upcoming/create', diskUpload.array('mediaFile', 10), async (req, res) => {
    try {
        if (!verifyAdminKey(req)) {
            // Delete uploaded files if unauthorized
            if (req.files && req.files.length > 0) {
                req.files.forEach(f => fs.unlink(f.path, () => {}));
            }
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }

        const {
            title, description, category, media_type, media_url,
            release_date, status, scheduled_time, meta_title, meta_description, og_image,
            removeMediaFlag
        } = req.body;

        if (!title) {
            if (req.files && req.files.length > 0) {
                req.files.forEach(f => fs.unlink(f.path, () => {}));
            }
            return res.status(400).json({ success: false, message: 'Title is required.' });
        }

        // Construct Gallery Array
        let galleryItems = [];

        // If they chose YouTube as media source, the primary URL is the youtube link
        if (media_type === 'youtube') {
            if (media_url) {
                galleryItems.push({ type: 'youtube', url: media_url });
            }
        }

        // Append any newly uploaded files
        if (req.files && req.files.length > 0 && removeMediaFlag !== 'true') {
            req.files.forEach(file => {
                const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
                galleryItems.push({ type, url: `/uploads/${file.filename}` });
            });
        } else if (req.files && removeMediaFlag === 'true') {
            // If flagged remove in the same request, delete all newly uploaded files
            req.files.forEach(f => fs.unlink(f.path, () => {}));
        }

        let finalMediaUrl = '';
        let finalMediaType = 'image';

        if (galleryItems.length > 0) {
            finalMediaUrl = galleryItems[0].url;
            finalMediaType = galleryItems[0].type;
        }

        // Get max sort_order
        const [maxOrderRow] = await db.query('SELECT MAX(sort_order) as max_order FROM upcoming_items');
        const nextOrder = (maxOrderRow && maxOrderRow[0] && maxOrderRow[0].max_order ? maxOrderRow[0].max_order : 0) + 1;

        const insertQuery = `
            INSERT INTO upcoming_items 
            (title, description, category, media_type, media_url, gallery, release_date, status, scheduled_time, meta_title, meta_description, og_image, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.execute(insertQuery, [
            title,
            description || '',
            category || 'Product',
            finalMediaType,
            finalMediaUrl,
            JSON.stringify(galleryItems),
            release_date || 'Coming Soon',
            status || 'published',
            scheduled_time || null,
            meta_title || '',
            meta_description || '',
            og_image || '',
            nextOrder
        ]);

        sendAdminNotification('Created', `A new item "${title}" has been created.\nCategory: ${category || 'Product'}\nStatus: ${status || 'published'}`);

        res.status(200).json({ success: true, message: 'Upcoming item created successfully!' });
    } catch (error) {
        console.error('Error creating upcoming item:', error);
        if (req.files && req.files.length > 0) {
            req.files.forEach(f => fs.unlink(f.path, () => {}));
        }
        res.status(500).json({ success: false, message: 'Failed to create upcoming item: ' + error.message });
    }
});

// ADMIN API: Update Upcoming Item
app.post('/api/admin/upcoming/update/:id', diskUpload.array('mediaFile', 10), async (req, res) => {
    try {
        if (!verifyAdminKey(req)) {
            if (req.files && req.files.length > 0) {
                req.files.forEach(f => fs.unlink(f.path, () => {}));
            }
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }

        const itemId = req.params.id;
        const {
            title, description, category, media_type, media_url,
            release_date, status, scheduled_time, meta_title, meta_description, og_image,
            removeMediaFlag, existingGallery
        } = req.body;

        if (!title) {
            if (req.files && req.files.length > 0) {
                req.files.forEach(f => fs.unlink(f.path, () => {}));
            }
            return res.status(400).json({ success: false, message: 'Title is required.' });
        }

        // Check if item exists
        const [existing] = await db.query('SELECT * FROM upcoming_items WHERE id = ?', [itemId]);
        if (!existing || existing.length === 0) {
            if (req.files && req.files.length > 0) {
                req.files.forEach(f => fs.unlink(f.path, () => {}));
            }
            return res.status(404).json({ success: false, message: 'Item not found.' });
        }

        // Get existing gallery items
        let galleryItems = [];
        if (existingGallery) {
            try {
                galleryItems = JSON.parse(existingGallery);
            } catch (err) {
                galleryItems = [];
            }
        } else {
            // fallback if not provided: load from existing db row
            if (existing[0].gallery) {
                try {
                    galleryItems = JSON.parse(existing[0].gallery);
                } catch (e) {
                    galleryItems = [];
                }
            } else if (existing[0].media_url) {
                galleryItems = [{ type: existing[0].media_type || 'image', url: existing[0].media_url }];
            }
        }

        // Check which existing items were deleted to unlink them from disk
        let oldGallery = [];
        if (existing[0].gallery) {
            try {
                oldGallery = JSON.parse(existing[0].gallery);
            } catch (e) {
                oldGallery = [];
            }
        } else if (existing[0].media_url) {
            oldGallery = [{ type: existing[0].media_type || 'image', url: existing[0].media_url }];
        }

        const remainingUrls = galleryItems.map(item => item.url);
        oldGallery.forEach(oldItem => {
            if (oldItem.url && oldItem.url.startsWith('/uploads/') && !remainingUrls.includes(oldItem.url)) {
                const oldPath = path.join(__dirname, oldItem.url);
                fs.unlink(oldPath, () => {});
            }
        });

        // If removeMediaFlag is true, delete ALL gallery items
        if (removeMediaFlag === 'true') {
            galleryItems.forEach(item => {
                if (item.url && item.url.startsWith('/uploads/')) {
                    const oldPath = path.join(__dirname, item.url);
                    fs.unlink(oldPath, () => {});
                }
            });
            galleryItems = [];
        }

        // Process newly uploaded files
        if (req.files && req.files.length > 0) {
            if (removeMediaFlag === 'true') {
                req.files.forEach(f => fs.unlink(f.path, () => {}));
            } else {
                req.files.forEach(file => {
                    const type = file.mimetype.startsWith('video/') ? 'video' : 'image';
                    galleryItems.push({ type, url: `/uploads/${file.filename}` });
                });
            }
        }

        // If media type is youtube, make sure it is in gallery
        if (media_type === 'youtube') {
            if (media_url) {
                // If youtube is selected, check if it's already first. Otherwise put it first.
                galleryItems = galleryItems.filter(item => item.type !== 'youtube');
                galleryItems.unshift({ type: 'youtube', url: media_url });
            }
        }

        let finalMediaUrl = '';
        let finalMediaType = 'image';

        if (galleryItems.length > 0) {
            // If the first item is youtube, use it
            finalMediaUrl = galleryItems[0].url;
            finalMediaType = galleryItems[0].type;
        }

        const updateQuery = `
            UPDATE upcoming_items SET
                title = ?, description = ?, category = ?, media_type = ?, media_url = ?, gallery = ?,
                release_date = ?, status = ?, scheduled_time = ?, meta_title = ?, meta_description = ?, og_image = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        await db.execute(updateQuery, [
            title,
            description || '',
            category || 'Product',
            finalMediaType,
            finalMediaUrl,
            JSON.stringify(galleryItems),
            release_date || 'Coming Soon',
            status || 'published',
            scheduled_time || null,
            meta_title || '',
            meta_description || '',
            og_image || '',
            itemId
        ]);

        sendAdminNotification('Updated', `Item "${title}" (ID: ${itemId}) has been updated.\nCategory: ${category || 'Product'}\nStatus: ${status || 'published'}`);

        res.status(200).json({ success: true, message: 'Upcoming item updated successfully!' });
    } catch (error) {
        console.error('Error updating upcoming item:', error);
        if (req.files && req.files.length > 0) {
            req.files.forEach(f => fs.unlink(f.path, () => {}));
        }
        res.status(500).json({ success: false, message: 'Failed to update upcoming item: ' + error.message });
    }
});

// ADMIN API: Delete Upcoming Item
app.post('/api/admin/upcoming/delete', async (req, res) => {
    try {
        if (!verifyAdminKey(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }

        const itemId = req.body.id;
        if (!itemId) {
            return res.status(400).json({ success: false, message: 'Item ID is required.' });
        }

        // Check if item exists to delete the uploaded media files
        const [existing] = await db.query('SELECT * FROM upcoming_items WHERE id = ?', [itemId]);
        if (!existing || existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Item not found.' });
        }

        // Parse and delete all gallery files
        let galleryItems = [];
        if (existing[0].gallery) {
            try {
                galleryItems = JSON.parse(existing[0].gallery);
            } catch (e) {
                galleryItems = [];
            }
        }
        
        galleryItems.forEach(item => {
            if (item.url && item.url.startsWith('/uploads/')) {
                const filePath = path.join(__dirname, item.url);
                fs.unlink(filePath, () => {});
            }
        });

        // Also delete the main media_url if not in the gallery for some reason
        if (existing[0].media_url && existing[0].media_url.startsWith('/uploads/')) {
            const isInsideGallery = galleryItems.some(item => item.url === existing[0].media_url);
            if (!isInsideGallery) {
                const filePath = path.join(__dirname, existing[0].media_url);
                fs.unlink(filePath, () => {});
            }
        }

        await db.execute('DELETE FROM upcoming_items WHERE id = ?', [itemId]);
        sendAdminNotification('Deleted', `Item "${existing[0].title}" (ID: ${itemId}) has been deleted.`);
        res.status(200).json({ success: true, message: 'Upcoming item deleted successfully!' });
    } catch (error) {
        console.error('Error deleting upcoming item:', error);
        res.status(500).json({ success: false, message: 'Failed to delete upcoming item.' });
    }
});

// ADMIN API: Bulk Delete Upcoming Items
app.post('/api/admin/upcoming/bulk-delete', async (req, res) => {
    try {
        if (!verifyAdminKey(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or empty ids array.' });
        }

        // 1. Fetch items to find any local files that need to be deleted
        const placeholders = ids.map(() => '?').join(',');
        const [items] = await db.query(`SELECT media_url, media_type, gallery FROM upcoming_items WHERE id IN (${placeholders})`, ids);

        // 2. Delete the database records
        await db.execute(`DELETE FROM upcoming_items WHERE id IN (${placeholders})`, ids);

        // 3. Delete their files in the filesystem (fire and forget)
        items.forEach(item => {
            let galleryItems = [];
            if (item.gallery) {
                try {
                    galleryItems = JSON.parse(item.gallery);
                } catch (e) {
                    galleryItems = [];
                }
            }
            galleryItems.forEach(galleryItem => {
                if (galleryItem.url && galleryItem.url.startsWith('/uploads/')) {
                    const filePath = path.join(__dirname, galleryItem.url);
                    fs.unlink(filePath, (err) => {
                        if (err && err.code !== 'ENOENT') {
                            console.error(`[FS ERROR] Failed to delete media file: ${filePath}`, err.message);
                        }
                    });
                }
            });
            if (item.media_url && item.media_url.startsWith('/uploads/')) {
                const isInsideGallery = galleryItems.some(gi => gi.url === item.media_url);
                if (!isInsideGallery) {
                    const filePath = path.join(__dirname, item.media_url);
                    fs.unlink(filePath, (err) => {
                        if (err && err.code !== 'ENOENT') {
                            console.error(`[FS ERROR] Failed to delete media file: ${filePath}`, err.message);
                        }
                    });
                }
            }
        });

        const details = items.map((item, idx) => `ID ${ids[idx]}: "${item.title || 'Untitled'}"`).join('\n');
        sendAdminNotification('Bulk Deleted', `The following ${ids.length} items have been bulk deleted:\n\n${details}`);
        return res.status(200).json({ success: true, message: `Successfully deleted ${ids.length} items.` });
    } catch (error) {
        console.error('Admin Bulk Delete upcoming error:', error);
        res.status(500).json({ success: false, message: 'Failed to bulk delete items: ' + error.message });
    }
});


// ADMIN API: Reorder items
app.post('/api/admin/upcoming/reorder', async (req, res) => {
    try {
        if (!verifyAdminKey(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized.' });
        }

        const { ids } = req.body; // Array of item IDs in new order
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ success: false, message: 'Invalid IDs array.' });
        }

        for (let i = 0; i < ids.length; i++) {
            await db.execute('UPDATE upcoming_items SET sort_order = ? WHERE id = ?', [i + 1, ids[i]]);
        }

        res.status(200).json({ success: true, message: 'Reordered successfully!' });
    } catch (error) {
        console.error('Error reordering items:', error);
        res.status(500).json({ success: false, message: 'Failed to reorder items.' });
    }
});

// ADMIN API: Get Settings
app.post('/api/admin/settings/get', async (req, res) => {
    try {
        if (!verifyAdminKey(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }
        const [rows] = await db.query('SELECT * FROM admin_settings');
        const settings = {};
        rows.forEach(r => {
            settings[r.setting_key] = r.setting_value;
        });
        return res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error('Error fetching admin settings:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
    }
});

// ADMIN API: Update Settings
app.post('/api/admin/settings/update', async (req, res) => {
    try {
        if (!verifyAdminKey(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }
        const { settings } = req.body;
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ success: false, message: 'Invalid settings payload.' });
        }
        for (const [key, value] of Object.entries(settings)) {
            if (dbType === 'sqlite') {
                await db.execute(
                    'INSERT OR REPLACE INTO admin_settings (setting_key, setting_value) VALUES (?, ?)',
                    [key, String(value)]
                );
            } else {
                await db.execute(
                    'INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                    [key, String(value), String(value)]
                );
            }
        }
        return res.status(200).json({ success: true, message: 'Settings updated successfully.' });
    } catch (error) {
        console.error('Error updating admin settings:', error);
        return res.status(500).json({ success: false, message: 'Failed to update settings.' });
    }
});

// ADMIN API: Toggle Status
app.post('/api/admin/upcoming/toggle-status', async (req, res) => {
    console.log(`\n[TOGGLE STATUS] Request received. Body:`, req.body);
    try {
        if (!verifyAdminKey(req)) {
            console.warn(`[TOGGLE STATUS] Unauthorized attempt.`);
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }
        const itemId = req.body.id;
        if (!itemId) {
            console.warn(`[TOGGLE STATUS] Missing item ID.`);
            return res.status(400).json({ success: false, message: 'Item ID is required.' });
        }
        
        console.log(`[TOGGLE STATUS] Fetching item from DB. ID: ${itemId}`);
        const [existing] = await db.query('SELECT status, title FROM upcoming_items WHERE id = ?', [itemId]);
        if (!existing || existing.length === 0) {
            console.warn(`[TOGGLE STATUS] Item with ID ${itemId} not found.`);
            return res.status(404).json({ success: false, message: 'Item not found.' });
        }
        
        const oldStatus = existing[0].status;
        const newStatus = oldStatus === 'published' ? 'draft' : 'published';
        console.log(`[TOGGLE STATUS] Toggling status from ${oldStatus} to ${newStatus} for ID ${itemId}`);
        
        await db.execute('UPDATE upcoming_items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, itemId]);
        console.log(`[TOGGLE STATUS] DB update successful.`);
        
        try {
            console.log(`[TOGGLE STATUS] Sending email notification...`);
            sendAdminNotification('Status Toggled', `Status of post "${existing[0].title}" was toggled from ${oldStatus} to ${newStatus}.`);
        } catch (emailErr) {
            console.error(`[TOGGLE STATUS] Email notification failed:`, emailErr.message);
        }

        res.status(200).json({ success: true, message: `Status updated to ${newStatus}.`, status: newStatus });
    } catch (error) {
        console.error('[TOGGLE STATUS ERROR] Exception occurred:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle status.' });
    }
});

// YouTube RSS Sync Function
const syncYouTubeVideos = async (force = false) => {
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!channelId) {
        console.log('[YOUTUBE SYNC] Skipped: YOUTUBE_CHANNEL_ID is not configured in .env.');
        return 0;
    }

    if (!force) {
        const [syncRow] = await db.query("SELECT setting_value FROM admin_settings WHERE setting_key = 'youtube_sync_enabled'");
        const syncEnabled = syncRow && syncRow[0] ? syncRow[0].setting_value === 'true' : true;
        if (!syncEnabled) {
            console.log('[YOUTUBE SYNC] Disabled by administrator settings.');
            return 0;
        }
    }

    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    try {
        console.log(`[YOUTUBE SYNC] Polling channel: ${channelId}...`);
        const response = await fetch(feedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        if (!response.ok) {
            throw new Error(`Feed request failed with status: ${response.status}`);
        }
        const xmlText = await response.text();
        
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;
        let importCount = 0;

        while ((match = entryRegex.exec(xmlText)) !== null) {
            const entryContent = match[1];
            
            const videoIdMatch = entryContent.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || entryContent.match(/<videoId>([^<]+)<\/videoId>/);
            const titleMatch = entryContent.match(/<title>([^<]+)<\/title>/);
            const thumbnailMatch = entryContent.match(/<media:thumbnail[^>]+url="([^"]+)"/) || entryContent.match(/<thumbnail[^>]+url="([^"]+)"/);
            const descriptionMatch = entryContent.match(/<media:description>([\s\S]*?)<\/media:description>/) || entryContent.match(/<description>([\s\S]*?)<\/description>/);
            const publishedMatch = entryContent.match(/<published>([^<]+)<\/published>/);

            if (videoIdMatch && titleMatch) {
                const videoId = videoIdMatch[1].trim();
                const title = titleMatch[1].trim();
                const thumbnail = thumbnailMatch ? thumbnailMatch[1].trim() : `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                const descriptionRaw = descriptionMatch ? descriptionMatch[1].trim() : '';
                // Simple HTML entity decode for common entities
                const description = descriptionRaw
                    .replace(/&quot;/g, '"')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&#39;/g, "'");

                const publishedStr = publishedMatch ? publishedMatch[1].trim() : '';
                
                // Check if video already exists in database
                const [existing] = await db.query('SELECT id FROM upcoming_items WHERE youtube_id = ?', [videoId]);
                if (!existing || existing.length === 0) {
                    console.log(`[YOUTUBE SYNC] New video found: "${title}". Importing...`);
                    
                    // Get next sort_order
                    const [maxOrderRow] = await db.query('SELECT MAX(sort_order) as max_order FROM upcoming_items');
                    const nextOrder = (maxOrderRow && maxOrderRow[0] && maxOrderRow[0].max_order ? maxOrderRow[0].max_order : 0) + 1;

                    const [pubRow] = await db.query("SELECT setting_value FROM admin_settings WHERE setting_key = 'youtube_auto_publish'");
                    const autoPublish = pubRow && pubRow[0] ? pubRow[0].setting_value === 'true' : true;
                    const status = autoPublish ? 'published' : 'pending_review';
                    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

                    const insertQuery = `
                        INSERT INTO upcoming_items 
                        (title, description, category, media_type, media_url, release_date, status, youtube_id, sort_order, meta_title, meta_description)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    await db.execute(insertQuery, [
                        title,
                        description,
                        'Video',
                        'youtube',
                        videoUrl,
                        'Published on YouTube',
                        status,
                        videoId,
                        nextOrder,
                        title,
                        description.substring(0, 150)
                    ]);
                    importCount++;

                    // Send email alert to admin
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: process.env.EMAIL_USER || 'info@cloudversesolution.com',
                        subject: `🚨 [Cloudverse] YouTube Video Synced: ${title}`,
                        text: `
A new video has been auto-imported from your YouTube channel:

Title: ${title}
Video URL: ${videoUrl}
Status: ${status}

Please review it in the Cloudverse Admin dashboard.
                        `
                    };
                    
                    transporter.sendMail(mailOptions).then(() => {
                        console.log(`[YOUTUBE SYNC] Notification email sent for "${title}".`);
                    }).catch(err => {
                        console.error('[YOUTUBE SYNC] Mail error:', err.message);
                    });
                }
            }
        }
        console.log(`[YOUTUBE SYNC] Finished polling. Imported ${importCount} new videos.`);
        return importCount;
    } catch (error) {
        console.error('[YOUTUBE SYNC ERROR] Failed to sync YouTube channel:', error);
        throw error;
    }
};

// ADMIN API: Manually trigger YouTube sync
app.post('/api/admin/upcoming/sync-youtube', async (req, res) => {
    try {
        if (!verifyAdminKey(req)) {
            return res.status(401).json({ success: false, message: 'Unauthorized. Incorrect admin key.' });
        }
        const count = await syncYouTubeVideos(true);
        res.status(200).json({ success: true, message: `Sync completed successfully. Imported ${count} new items.` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'YouTube Sync failed: ' + error.message });
    }
});

// Scheduled Publishing Check
const checkScheduledPublishing = async () => {
    try {
        let updateQuery;
        if (dbType === 'sqlite') {
            updateQuery = `
                UPDATE upcoming_items 
                SET status = 'published' 
                WHERE status = 'scheduled' AND datetime(scheduled_time) <= datetime('now', 'localtime')
            `;
        } else {
            updateQuery = `
                UPDATE upcoming_items 
                SET status = 'published' 
                WHERE status = 'scheduled' AND scheduled_time <= NOW()
            `;
        }
        const [result] = await db.execute(updateQuery);
        const changes = result && result.changes ? result.changes : (result && result.affectedRows ? result.affectedRows : 0);
        if (changes > 0) {
            console.log(`[SCHEDULE WORKER] Published ${changes} scheduled upcoming items.`);
        }
    } catch (error) {
        console.error('[SCHEDULE WORKER ERROR] Failed to run scheduled publishing checks:', error);
    }
};

// Start background cron intervals
setInterval(checkScheduledPublishing, 60 * 1000); // Check scheduled publishing every 1 minute
setInterval(syncYouTubeVideos, 60 * 60 * 1000);   // Sync YouTube RSS every 1 hour

// Trigger initial checks/sync shortly after start
setTimeout(() => {
    checkScheduledPublishing();
    syncYouTubeVideos();
}, 5000);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server is running at http://localhost:${PORT}`);
    console.log(`✉️ Make sure to set EMAIL_USER and EMAIL_PASS in your .env file!`);
});
