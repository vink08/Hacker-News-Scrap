const express = require('express');
const http = require('http');
const scrapeHackerNews = require('./controllers/scraper');
const setupWebSocket = require('./routes/websocket');
const pool = require('./config/db');

const app = express();
const server = http.createServer(app);

scrapeHackerNews().catch((error) => {
    console.error('Error during initial scrape:', error);
});

setupWebSocket(server);

app.get('/health', (req, res) => {
    res.send('OK');
});

app.get('/stories', async (req, res) => {
    try {
        const [results] = await pool.query('SELECT * FROM stories ORDER BY posted_at DESC');
        res.json(results);
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).send('Error fetching stories');
    }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (error) => {
    console.error('Server error:', error);
});
