
const mysql = require('mysql2/promise'); // Using promise-based version

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'B202507',
    database: 'hacker_news',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
