const express = require("express");
const router = express.Router();
const albumController = require("../controllers/albumController");

// Index
router.get("/", albumController.index);
// Show -> cerco un singolo album
router.get("/:slug", albumController.show);
// Filtro avanzato per album
router.get("/filter/advanced", albumController.filter);
// Filtro album per cd
router.get("/filter/cd", albumController.filterCD);
// Filtro album per vinyl
router.get("/filter/vinyl", albumController.filterVinyl);

module.exports = router;
