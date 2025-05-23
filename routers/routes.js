const express = require('express');
const router = express.Router();
const albumController = require('../controllers/albumController');

router.get('/', albumController.index);

router.get('/:id', albumController.show);

module.exports = router;