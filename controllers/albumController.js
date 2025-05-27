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
    const searchLower = search.toLowerCase();
    sql += `WHERE LOWER(album.name) LIKE ? OR LOWER(genres.name) LIKE ? OR LOWER(artist.name) LIKE ? `;
    preparedParams.push(`%${searchLower}%`, `%${searchLower}%`, `%${searchLower}%`);
  };

  sql += `ORDER BY album.id ASC`;

  connection.query(sql, preparedParams, (err, results) => {
    if (err) {
      console.error("Errore nella query al database:", err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    };

    res.json(results.map(formatAlbum));
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
    };

    if (result.length === 0)
      return res.status(404).json({ errorMessage: 'Error Server' })

    res.json(formatAlbum(result[0]));
  })
}

// Filtra album per nome, genere e artista
function filter(req, res) {
  const { name, genre, artist } = req.query;
  const preparedParams = [];
  let whereClauses = [];
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

  if (name) {
    whereClauses.push("LOWER(album.name) LIKE ?");
    preparedParams.push(`%${name.toLowerCase()}%`);
  };

  if (genre) {
    whereClauses.push("LOWER(genres.name) LIKE ?");
    preparedParams.push(`%${genre.toLowerCase()}%`);
  };

  if (artist) {
    whereClauses.push("LOWER(artist.name) LIKE ?");
    preparedParams.push(`%${artist.toLowerCase()}%`);
  };

  if (whereClauses.length > 0)
    sql += " WHERE " + whereClauses.join(" AND ");

  sql += " ORDER BY album.id ASC";

  connection.query(sql, preparedParams, (err, results) => {
    if (err) {
      console.error("Errore nella query al database:", err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }
    res.json(results.map(formatAlbum));
  });
}

// Funzione di utilità per formattare un album
function formatAlbum(album) {
  return {
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
  };
}

module.exports = {
  index, show, filter
};