// Simple static file server for local development
// In production, Vercel serves static files and handles API routes automatically

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Spelling Bee Space development server running on port ${PORT}`);
    console.log(`📱 App: http://localhost:${PORT}`);
    console.log(`⚡ Using Vercel Edge Functions for API routes in production`);
});

module.exports = app;