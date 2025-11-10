const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Secure TTS endpoint
app.post('/api/tts', async (req, res) => {
    try {
        const { text, voice = 'nova', speed = 0.9 } = req.body;

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