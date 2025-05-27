const connection = require("../data/db");

//index
function index(req, res) {
  const sql = `
    SELECT 
      albums.*,
      genres.slug AS genre_slug, 
      genres.name AS genre_name, 
      artists.slug AS artist_slug, 
      artists.name AS artist_name
    FROM albums 
    INNER JOIN genres ON genres.id = albums.genre_id
    INNER JOIN artists ON artists.id = albums.id_artist
    ORDER BY albums.id ASC
  `;


  connection.query(sql, (err, results) => {
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
      albums.*, 
      genres.slug AS genre_slug, 
      genres.name AS genre_name, 
      artists.slug AS artist_slug,
      artists.name AS artist_name
    FROM albums 
    INNER JOIN genres ON genres.id = albums.genre_id
    INNER JOIN artists ON artists.id = albums.id_artist
    WHERE albums.slug = ?
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
        slug: genre_slug,
        name: album.genre_name
      },
      artist: {
        slug: artist_slug,
        name: album.artist_name
      },
    });
  })
}

module.exports = {
  index, show
};