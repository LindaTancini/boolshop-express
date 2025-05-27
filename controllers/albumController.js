const connection = require("../data/db");

//index
function index(req, res) {
    const { search } = req.query;

    const preparedParams = [];

    let sql = `
    SELECT 
      album.*,
      genres.slug AS genre_slug, 
      genres.name AS genre_name, 
      artist.slug AS artist_slug, 
      artist.name AS artist_name
    FROM album 
    INNER JOIN genres ON genres.id = album.genre_id
    INNER JOIN artist ON artist.id = album.id_artist
  `;
    
    if (search) {
        sql += `WHERE album.name LIKE ? OR genres.name LIKE ? OR artist.name LIKE ? `;
        preparedParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    console.log(search);

    sql += `ORDER BY album.id ASC`;

    connection.query(sql, preparedParams, (err, results) => {
        if (err) {
            console.error("Errore nella query al database:", err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
        res.json(results.map((album) => ({
            id: album.id,
            slug: album.slug,
            title: album.name,
            cover: album.cover,
            genre: {
                slug: album.genre_slug,
                name: album.genre_name
            },
            artist: {
                slug: album.artist_slug,
                name: album.artist_name
            }
        })));
    });
}

//show
function show(req, res) {
    const { slug } = req.params;

    const sql = `
    SELECT 
      album.*, 
      genres.slug AS genre_slug, 
      genres.name AS genre_name, 
      artist.slug AS artist_slug,
      artist.name AS artist_name
    FROM album 
    INNER JOIN genres ON genres.id = album.genre_id
    INNER JOIN artist ON artist.id = album.id_artist
    WHERE album.slug = ?
  `;

    connection.query(sql, [slug], (err, result) => {
        if (err) {
            console.error("Errore nella query al database:", err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }
        if (result.length === 0) return res.status(404).json({ errorMessage: 'Error Server' })
        let album = result[0];
        res.json({
            id: album.id,
            slug,
            title: album.name,
            cover: album.cover,
            genre: {
                slug: album.genre_slug,
                name: album.genre_name
            },
            artist: {
                slug: album.artist_slug,
                name: album.artist_name
            },
        });
    })
}

module.exports = {
    index, show
};