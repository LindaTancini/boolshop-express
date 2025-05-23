const connection = require("../data/db");

function index(req, res) {
    const sql = 'SELECT * FROM albums';

    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Errore nella query al database:", err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
        res.json(results.map((album) => {
            return {
                id: album.id,
                title: album.name,
                cover: album.cover
            };
        }));
    });
}

module.exports = {
    index
};