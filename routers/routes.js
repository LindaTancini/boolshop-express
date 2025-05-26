const express = require("express");
const router = express.Router();
const albumController = require("../controllers/albumController");

// Index
router.get("/", albumController.index);
// Show -> cerco un singolo album
router.get("/:slug", albumController.show);

module.exports = router;
