const express = require("express");
const router = express.Router();
const artistsController = require("../controllers/artistController");

// Index
router.get("/", artistsController.index);
// Show -> cerco un singolo album
router.get("/:slug", artistsController.show);

module.exports = router;