// Import delle dipendenze principali
const connection = require("../data/db");
const getLimitOffset = require('../utils/getLimitOffset');

// Endpoint: tutti gli album (con eventuale ricerca/filtro)
function index(req, res) {
  queryAlbums({ req, res });
}

// Endpoint: solo album CD
function filterCD(req, res) {
  queryAlbums({ req, res, format: "CD" });
}

// Endpoint: solo album Vinile
function filterVinyl(req, res) {
  queryAlbums({ req, res, format: "Vinyl" });
}

// Endpoint: dettaglio di un album tramite slug
function show(req, res) {
  const { slug } = req.params;
  const sql = `
    SELECT 
      album.*,
      genres.slug AS genre_slug,
      genres.name AS genre_name, 
      artist.slug AS artist_slug, 
      artist.name AS artist_name 
    FROM 
      album 
    INNER JOIN 
      genres ON genres.id = album.genre_id
    INNER JOIN 
      artist ON artist.id = album.id_artist
    WHERE album.slug = ?
  `;

  connection.query(sql, [slug], (err, result) => {
    if (err) {
      console.error("Errore nella query al database:", err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }

    if (result.length === 0)
      return res.status(404).json({ errorMessage: 'Error Server' });

    res.json(formatAlbum(result[0]));
  });
}

// Endpoint avanzato: filtra album per più parametri (body), con paginazione e ordinamento
function filter(req, res) {
  const { format, genre, price, artist, order } = req.body;
  const preparedParams = [];
  const whereClauses = [
    format ? "LOWER(album.format) LIKE ?" : null,
    genre ? "LOWER(genres.name) LIKE ?" : null,
    price ? "LOWER(album.price) BETWEEN ? AND ?" : null,
    artist ? "LOWER(artist.name) LIKE ?" : null
  ].filter(Boolean);


  if (format)
    preparedParams.push(format.toLowerCase());

  if (genre)
    preparedParams.push(genre.toLowerCase());

  if (price)
    preparedParams.push(...price.split(':').map(e => parseFloat(e)));

  if (artist)
    preparedParams.push(artist.toLowerCase());


  let sql = `
    SELECT 
      album.*, 
      genres.slug AS genre_slug, 
      genres.name AS genre_name, 
      artist.slug AS artist_slug, 
      artist.name AS artist_name 
    FROM 
      album 
    INNER JOIN 
      genres ON genres.id = album.genre_id 
    INNER JOIN 
      artist ON artist.id = album.id_artist
  `;

  sql += whereClauses.length ? " WHERE " + whereClauses.join(" AND ") : '';

  const orders = {
    disp: 'album.quantity ASC',
    sell: 'album.quantity DESC',
    name_asc: 'album.name ASC',
    name_desc: 'album.name DESC',
    price_asc: 'album.price ASC',
    price_desc: 'album.price DESC',
    date_asc: 'album.release_date ASC',
    date_desc: 'album.release_date DESC',
  };

  sql += order ? ` ORDER BY ${orders[order] ?? 'album.id ASC'}` : '';

  // Paginazione
  const { limit, offset } = getLimitOffset(req);
  limit && (sql += " LIMIT ?", preparedParams.push(limit));
  offset && (sql += " OFFSET ?", preparedParams.push(offset));

  connection.query(sql, preparedParams, (err, results) => {
    if (err) {
      console.error("Errore nella query al database:", err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }

    res.json(results.map(formatAlbum));
  });
}

// --- FUNZIONI AUSILIARIE ---

// Costruisce dinamicamente la query SQL per la ricerca album (usata da index, filterCD, filterVinyl)
function buildAlbumQuery({ format, search, filter }) {
  const preparedParams = [];
  // Query base con join su generi e artisti
  let sql = `
    SELECT 
      album.*,
      genres.slug AS genre_slug, 
      genres.name AS genre_name, 
      artist.slug AS artist_slug, 
      artist.name AS artist_name 
    FROM 
      album 
    INNER JOIN 
      genres ON genres.id = album.genre_id 
    INNER JOIN 
      artist ON artist.id = album.id_artist`;

  // Costruzione dinamica dei filtri WHERE
  const whereClauses = [
    format ? 'album.format = ?' : null,
    search ? '(LOWER(album.name) LIKE ? OR LOWER(genres.name) LIKE ? OR LOWER(artist.name) LIKE ?)' : null
  ].filter(Boolean);

  if (format)
    preparedParams.push(format);

  if (search) {
    const searchLower = search.toLowerCase();
    preparedParams.push(`%${searchLower}%`, `%${searchLower}%`, `%${searchLower}%`);
  }

  sql += whereClauses.length ? ' WHERE ' + whereClauses.join(' AND ') : '';

  // Ordinamento dinamico
  const orderMap = {
    "": "ORDER BY album.id ASC",
    "ordine crescente per nome": "ORDER BY album.name ASC",
    "ordine decrescente per nome": "ORDER BY album.name DESC",
    "i più nuovi": "ORDER BY album.release_date DESC",
    "i più vecchi": "ORDER BY album.release_date ASC"
  };
  sql += ` ${orderMap[filter] ?? "ORDER BY album.id ASC"}`;

  return { sql, preparedParams };
}

// Esegue la query album generica e restituisce i risultati formattati
function queryAlbums({ req, res, format = undefined }) {
  const { search, filter } = req.query;
  const { sql, preparedParams } = buildAlbumQuery({ format, search, filter });

  connection.query(sql, preparedParams, (err, results) => {
    if (err) {
      console.error("Errore nella query al database:", err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }

    res.json(results.map(formatAlbum));
  });
}

// Formatta un oggetto album per la risposta API
function formatAlbum(album) {
  return {
    id: album.id,
    slug: album.slug,
    name: album.name,
    cover: album.cover,
    price: album.price,
    date: album.release_date,
    quantity: album.quantity,
    imagePath: `${process.env.IMG_PATH}${album.cover}`,
    format: album.format,
    genre: {
      slug: album.genre_slug,
      name: album.genre_name
    },
    artist: {
      slug: album.artist_slug,
      name: album.artist_name
    },
  };
}

// Endpoint: restituisce tutti i formati disponibili
function formats(req, res) {
  const sql = 'SELECT DISTINCT format FROM album';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Errore nella query al database:', err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }
    // Restituisce array di stringhe (formati)
    res.json(results.map(r => r.format));
  });
}

// Endpoint: restituisce il prezzo minimo e massimo degli album
function priceRange(req, res) {
  const sql = 'SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM album';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Errore nella query al database:', err);
      return res.status(500).json({ error: 'Database query failed', details: err.message });
    }
    res.json(results[0]);
  });
}

// Esportazione dei controller
module.exports = {
  index, show, filter, filterCD, filterVinyl, formats, priceRange
};