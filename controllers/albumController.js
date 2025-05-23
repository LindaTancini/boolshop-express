const connection = require("../data/db");

//index
function index(req, res) {
    // const sql = `SELECT * FROM albums`
    const sql = `SELECT albums.*, genres.name AS 'genre', artists.name AS 'artist'
                    FROM albums 
                    INNER JOIN genres ON genres.id = albums.genre_id
                    INNER JOIN artists ON artists.id = albums.id_artist
                    ORDER BY albums.id ASC`;


    connection.query(sql, (err, results) => {
        if (err) {
            console.error("Errore nella query al database:", err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
        res.json(results.map((album) => ({
            id: album.id,
            title: album.name,
            cover: album.cover,
            genre: album.genre,
            artist: album.artist
        })));
    });
}

//show
function show(req, res) {
    const { id } = req.params;

    const sql = 'SELECT * FROM albums WHERE albums.id = ?';

    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Errore nella query al database:", err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
        if (result.length === 0) return res.status(404).json({ errorMessage: 'Error Server' })
        res.json(result[0]);

    })
}

module.exports = {
    index, show
};