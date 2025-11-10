const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const geoip = require('geoip-lite');
const ExcelJS = require('exceljs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SQLite database for user tracking
const db = new sqlite3.Database('./user_tracking.db');

// Create user tracking table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE,
        ip_address TEXT,
        country TEXT,
        region TEXT,
        city TEXT,
        latitude REAL,
        longitude REAL,
        user_agent TEXT,
        first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        total_visits INTEGER DEFAULT 1,
        words_practiced INTEGER DEFAULT 0,
        ai_speech_used INTEGER DEFAULT 0,
        classic_speech_used INTEGER DEFAULT 0
    )`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_session_id ON user_sessions(session_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_ip_address ON user_sessions(ip_address)`);
});

// Helper function to get client IP
function getClientIP(req) {
    return req.headers['x-forwarded-for'] ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           req.ip;
}

// Helper function to track user session
function trackUserSession(req, sessionId = null) {
    const ip = getClientIP(req);
    const geo = geoip.lookup(ip) || {};
    const userAgent = req.headers['user-agent'] || '';
    const currentSessionId = sessionId || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
        // Check if session exists
        db.get("SELECT * FROM user_sessions WHERE session_id = ?", [currentSessionId], (err, row) => {
            if (err) {
                reject(err);
                return;
            }

            if (row) {
                // Update existing session
                db.run(`UPDATE user_sessions SET
                        last_activity = CURRENT_TIMESTAMP,
                        total_visits = total_visits + 1
                        WHERE session_id = ?`, [currentSessionId], (err) => {
                    if (err) reject(err);
                    else resolve(currentSessionId);
                });
            } else {
                // Create new session
                db.run(`INSERT INTO user_sessions
                        (session_id, ip_address, country, region, city, latitude, longitude, user_agent)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        currentSessionId,
                        ip,
                        geo.country || 'Unknown',
                        geo.region || 'Unknown',
                        geo.city || 'Unknown',
                        geo.ll ? geo.ll[0] : null,
                        geo.ll ? geo.ll[1] : null,
                        userAgent
                    ], (err) => {
                    if (err) reject(err);
                    else resolve(currentSessionId);
                });
            }
        });
    });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// User tracking endpoints
app.post('/api/track/session', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const newSessionId = await trackUserSession(req, sessionId);
        res.json({ sessionId: newSessionId, success: true });
    } catch (error) {
        console.error('Session tracking error:', error);
        res.status(500).json({ error: 'Failed to track session' });
    }
});

app.post('/api/track/word', async (req, res) => {
    try {
        const { sessionId, action } = req.body; // action: 'practiced', 'ai_speech', 'classic_speech'

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }

        let updateQuery = '';
        switch (action) {
            case 'practiced':
                updateQuery = 'UPDATE user_sessions SET words_practiced = words_practiced + 1, last_activity = CURRENT_TIMESTAMP WHERE session_id = ?';
                break;
            case 'ai_speech':
                updateQuery = 'UPDATE user_sessions SET ai_speech_used = ai_speech_used + 1, last_activity = CURRENT_TIMESTAMP WHERE session_id = ?';
                break;
            case 'classic_speech':
                updateQuery = 'UPDATE user_sessions SET classic_speech_used = classic_speech_used + 1, last_activity = CURRENT_TIMESTAMP WHERE session_id = ?';
                break;
            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

        db.run(updateQuery, [sessionId], (err) => {
            if (err) {
                console.error('Track word error:', err);
                res.status(500).json({ error: 'Failed to track action' });
            } else {
                res.json({ success: true });
            }
        });
    } catch (error) {
        console.error('Word tracking error:', error);
        res.status(500).json({ error: 'Failed to track word action' });
    }
});

app.get('/api/admin/export', async (req, res) => {
    try {
        const { password } = req.query;

        // Simple password protection
        if (password !== process.env.ADMIN_PASSWORD && password !== 'spellingbee2024') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        db.all("SELECT * FROM user_sessions ORDER BY first_visit DESC", (err, rows) => {
            if (err) {
                console.error('Export error:', err);
                res.status(500).json({ error: 'Failed to export data' });
                return;
            }

            // Create Excel workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('User Tracking Data');

            // Add headers
            worksheet.columns = [
                { header: 'ID', key: 'id', width: 10 },
                { header: 'Session ID', key: 'session_id', width: 25 },
                { header: 'IP Address', key: 'ip_address', width: 15 },
                { header: 'Country', key: 'country', width: 15 },
                { header: 'Region', key: 'region', width: 15 },
                { header: 'City', key: 'city', width: 15 },
                { header: 'Latitude', key: 'latitude', width: 12 },
                { header: 'Longitude', key: 'longitude', width: 12 },
                { header: 'User Agent', key: 'user_agent', width: 30 },
                { header: 'First Visit', key: 'first_visit', width: 20 },
                { header: 'Last Activity', key: 'last_activity', width: 20 },
                { header: 'Total Visits', key: 'total_visits', width: 12 },
                { header: 'Words Practiced', key: 'words_practiced', width: 15 },
                { header: 'AI Speech Used', key: 'ai_speech_used', width: 15 },
                { header: 'Classic Speech Used', key: 'classic_speech_used', width: 18 }
            ];

            // Add data
            rows.forEach(row => {
                worksheet.addRow(row);
            });

            // Style header
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            // Set response headers
            const filename = `spelling-bee-tracking-${new Date().toISOString().split('T')[0]}.xlsx`;
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            // Send Excel file
            workbook.xlsx.write(res).then(() => {
                res.end();
            });
        });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

// Secure TTS endpoint
app.post('/api/tts', async (req, res) => {
    try {
        const { text, voice = 'nova', speed = 0.9, sessionId } = req.body;

        // Validate input
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (text.length > 200) {
            return res.status(400).json({ error: 'Text too long (max 200 characters)' });
        }

        // Clean text
        const cleanText = text.trim().replace(/[<>]/g, '') + ". ";

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'tts-1-hd',
                input: cleanText,
                voice: voice,
                speed: Math.max(0.25, Math.min(4.0, speed)),
                response_format: 'mp3'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API Error:', response.status, errorText);
            return res.status(500).json({ error: 'Speech generation failed' });
        }

        // Track AI speech usage
        if (sessionId) {
            db.run('UPDATE user_sessions SET ai_speech_used = ai_speech_used + 1, last_activity = CURRENT_TIMESTAMP WHERE session_id = ?', [sessionId], (err) => {
                if (err) console.error('Failed to track AI speech usage:', err);
            });
        }

        // Stream audio back to client
        const audioBuffer = await response.arrayBuffer();
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.byteLength,
            'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        });

        res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        hasApiKey: !!process.env.OPENAI_API_KEY
    });
});

// Serve the main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Spelling Bee Matrix server running on port ${PORT}`);
    console.log(`📱 App: http://localhost:${PORT}`);
    console.log(`🔑 API Key configured: ${!!process.env.OPENAI_API_KEY}`);
});

module.exports = app;