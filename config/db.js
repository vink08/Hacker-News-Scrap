// const mysql = require('mysql2');
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'Iitjee@2021',
//     database: 'hacker_news',
// });

// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL:', err);
//         process.exit(1);
//     } else {
//         console.log('Connected to MySQL at', new Date());
//     }
// });

// module.exports = connection;
const mysql = require('mysql2/promise'); // Using promise-based version

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Iitjee@2021',
    database: 'hacker_news',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
