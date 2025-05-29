const connection = require("../data/db");
const getLimitOffset = require('../utils/getLimitOffset');

//index
function index(req, res) {
    const { search } = req.query;
    const {filter} =req.query;
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

    if(filter=== ""){
        sql += `ORDER BY album.id ASC`;
    }

    if (filter === "ordine crescente per nome"){
        sql += `ORDER BY album.name ASC`;
    }
    if (filter === "ordine decrescente per nome"){
        sql += `ORDER BY album.name DESC`;
    }
    if (filter === "i più nuovi"){
        sql += `ORDER BY album.release_date DESC`;
    }
    if (filter === "i più vecchi"){
        sql += `ORDER BY album.release_date ASC`;
    }

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
    // const { search } = req.params;
    const { format, genre, price, artist, order } = req.body;
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

    // formato, genere, prezzo, artista
    if (format) {
        whereClauses.push("LOWER(album.format) LIKE ?");
        preparedParams.push(format.toLowerCase());
    };

    if (genre) {
        whereClauses.push("LOWER(genres.name) LIKE ?");
        preparedParams.push(genre.toLowerCase());
    };

    if (price) {
        const prices = price.split(':').map(e => parseFloat(e));
        whereClauses.push("LOWER(album.price) BETWEEN ? AND ?");
        preparedParams.push(...prices);
    };

    if (artist) {
        whereClauses.push("LOWER(artist.name) LIKE ?");
        preparedParams.push(artist.toLowerCase());
    };


    if (whereClauses.length > 0)
        sql += " WHERE " + whereClauses.join(" AND ");


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

    if (order)
        sql += ` ORDER BY ${orders[order] ?? 'album.id ASC'}`;


    // Paginazione
    const { limit, offset } = getLimitOffset(req);

    if (limit) {
        sql += " LIMIT ?";
        preparedParams.push(limit);
    };

    if (offset) {
        sql += " OFFSET ?";
        preparedParams.push(offset);
    };

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


function filterCD(req, res) {
    const { filter } = req.query;
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
    WHERE album.format = "CD" `;
    
    if (search) {
        const searchLower = search.toLowerCase();
        sql += `AND LOWER(album.name) LIKE ? OR LOWER(genres.name) LIKE ? OR LOWER(artist.name) LIKE ? `;
        preparedParams.push(`%${searchLower}%`, `%${searchLower}%`, `%${searchLower}%`);
    };
    
    if (filter === "") {
        sql += `ORDER BY album.id ASC`;
    }

    if (filter === "ordine crescente per nome") {
        sql += `ORDER BY album.name ASC`;
    }
    if (filter === "ordine decrescente per nome") {
        sql += `ORDER BY album.name DESC`;
    }
    if (filter === "i più nuovi") {
        sql += `ORDER BY album.release_date DESC`;
    }
    if (filter === "i più vecchi") {
        sql += `ORDER BY album.release_date ASC`;
    }

    connection.query(sql, preparedParams, (err, result) => {
        if (err) {
            console.error("Errore nella query al database:", err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }

        res.json(result.map(formatAlbum));
    });

}

function filterVinyl(req, res) {
    const { filter } = req.query;
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
    WHERE album.format = "Vinyl"`;

    if (search) {
        const searchLower = search.toLowerCase();
        sql += `AND LOWER(album.name) LIKE ? OR LOWER(genres.name) LIKE ? OR LOWER(artist.name) LIKE ? `;
        preparedParams.push(`%${searchLower}%`, `%${searchLower}%`, `%${searchLower}%`);
    };

    if (filter === "") {
        sql += `ORDER BY album.id ASC`;
    }

    if (filter === "ordine crescente per nome") {
        sql += `ORDER BY album.name ASC`;
    }
    if (filter === "ordine decrescente per nome") {
        sql += `ORDER BY album.name DESC`;
    }
    if (filter === "i più nuovi") {
        sql += `ORDER BY album.release_date DESC`;
    }
    if (filter === "i più vecchi") {
        sql += `ORDER BY album.release_date ASC`;
    }

    console.log(sql);
    connection.query(sql, preparedParams, (err, result) => {
        if (err) {
            console.error("Errore nella query al database:", err);
            return res.status(500).json({ error: 'Database query failed', details: err.message });
        }

        res.json(result.map(formatAlbum));
    });

}

module.exports = {
    index, show, filter, filterCD, filterVinyl
};