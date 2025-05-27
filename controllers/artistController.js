const connection = require("../data/db");

//index
function index(req, res) {
    const sql = `SELECT artists.* FROM artists`;


    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Errore nella query al database:", err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
        res.json(results);
    });
}

//show
function show(req, res) {
    const { slug } = req.params;

    const sql = `SELECT artists.* FROM artists
                WHERE artists.slug = ?`;

    connection.query(sql, [slug], (err, result) => {
        if (err) {
            console.error("Errore nella query al database:", err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
        if (result.length === 0) return res.status(404).json({ errorMessage: 'Error Server' })
        let album = result[0];
        res.json(album);
    })
}

module.exports = {
    index, show
};