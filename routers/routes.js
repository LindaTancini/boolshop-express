const express = require("express");
const router = express.Router();
const albumController = require("../controllers/albumController");

// Index
router.get("/", albumController.index);
// Filtro avanzato per album
router.get("/filter/advanced", albumController.filter);
// Filtro album per cd
router.get("/filter/cd", albumController.filterCD);
// Filtro album per vinyl
router.get("/filter/vinyl", albumController.filterVinyl);
// Endpoint per ottenere tutti i formati disponibili
router.get("/formats", albumController.formats);
// Endpoint per ottenere il range di prezzo
router.get("/price-range", albumController.priceRange);
// Show -> cerco un singolo album (deve stare in fondo!)
router.get("/:slug", albumController.show);

module.exports = router;
