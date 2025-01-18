// const WebSocket = require('ws');
// const connection = require('../config/db');
// const scrapeHackerNews = require('../controllers/scraper');

// function setupWebSocket(server) {
//     const wss = new WebSocket.Server({ server });

//     wss.on('connection', async (ws) => {
//         console.log('Client connected at', new Date());

//         const broadcast = (data) => {
//             wss.clients.forEach(client => {
//                 if (client.readyState === WebSocket.OPEN) {
//                     client.send(JSON.stringify(data));
//                 }
//             });
//         };

//         // Send initial data
//         try {
//             const query = `
//                 SELECT * FROM stories 
//                 WHERE posted_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
//             `;
//             connection.query(query, (err, results) => {
//                 if (err) {
//                     console.error('Error fetching recent stories:', err);
//                     ws.send(JSON.stringify({ error: 'Error fetching data' }));
//                     return;
//                 }
//                 console.log('Initial data sent to client:', results.length, 'stories.');
//                 ws.send(JSON.stringify({
//                     type: 'initial',
//                     stories: results
//                 }));
//             });

//             // Start periodic scraping
//             const scrapeInterval = setInterval(async () => {
//                 try {
//                     const newStories = await scrapeHackerNews();
//                     if (newStories && newStories.length > 0) {
//                         console.log('Broadcasting new stories:', newStories.length);
//                         broadcast({
//                             type: 'update',
//                             stories: newStories
//                         });
//                     }
//                 } catch (error) {
//                     console.error('Error during periodic scraping:', error);
//                 }
//             }, 300000); // 5 minutes

//             ws.on('close', () => {
//                 clearInterval(scrapeInterval);
//                 console.log('Client disconnected at', new Date());
//             });

//         } catch (error) {
//             console.error('WebSocket error:', error);
//             ws.send(JSON.stringify({ error: 'WebSocket error occurred' }));
//         }
//     });

//     return wss;
// }

// module.exports = setupWebSocket;



const WebSocket = require('ws');
const pool = require('../config/db');
const scrapeHackerNews = require('../controllers/scraper');

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', async (ws) => {
        console.log('Client connected at', new Date());

        const broadcast = (data) => {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        };

        let scrapeInterval;

        try {
            // Send initial data
            const [rows] = await pool.query(`
                SELECT * FROM stories 
                WHERE posted_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
                ORDER BY posted_at DESC
            `);

            ws.send(
                JSON.stringify({
                    type: 'initial',
                    count: rows.length,
                    stories: rows,
                })
            );

            console.log('Initial data sent:', rows.length, 'stories');

            // Start periodic scraping
            scrapeInterval = setInterval(async () => {
                try {
                    const newStories = await scrapeHackerNews();
                    if (newStories && newStories.length > 0) {
                        broadcast({
                            type: 'update',
                            stories: newStories,
                        });
                        console.log('Broadcast new stories:', newStories.length);
                    }
                } catch (error) {
                    console.error('Error during scraping:', error);
                }
            }, 300000); // 5 minutes interval
        } catch (error) {
            console.error('Error during WebSocket initialization:', error);
            ws.send(
                JSON.stringify({
                    error: 'Failed to fetch initial stories. Please try again later.',
                })
            );
        }

        // Handle client disconnection
        ws.on('close', () => {
            if (scrapeInterval) {
                clearInterval(scrapeInterval);
            }
            console.log('Client disconnected at', new Date());
        });
    });

    // Handle server shutdown gracefully
    process.on('SIGINT', () => {
        wss.clients.forEach((client) => client.close());
        wss.close();
        console.log('WebSocket server closed.');
        process.exit();
    });

    return wss;
}

module.exports = setupWebSocket;
