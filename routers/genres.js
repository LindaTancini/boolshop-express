const express = require("express");
const router = express.Router();
const genresController = require("../controllers/genreController");

// Index
router.get("/", genresController.index);
// Show -> cerco un singolo album
router.get("/:slug", genresController.show);

module.exports = router;