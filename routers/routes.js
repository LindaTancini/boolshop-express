const express = require("express");
const router = express.Router();
const albumController = require("../controllers/albumController");

// Index
router.get("/", albumController.index);
// Show -> cerco un singolo album
router.get("/:slug", albumController.show);
// Filtro avanzato per album
router.get("/filter/advanced", albumController.filter);

module.exports = router;
