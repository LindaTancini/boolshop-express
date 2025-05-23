const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: 'root',
    password: 'vincenzo22',
    database: process.env.DB_NAME
});
connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});
module.exports = connection;