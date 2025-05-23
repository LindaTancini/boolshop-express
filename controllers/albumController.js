const connection = require("../data/db")

function index(req, res) {

    const sql = 'SELECT * FROM albums';

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });
        res.json(results.map((albums) => {
            return {
                id: albums.id,
                title: albums.name,
                cover: albums.cover
            }
        }));
    })
};

module.exports = {
    index
};