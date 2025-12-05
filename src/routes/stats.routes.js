const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/stats.controller');

router.get('/top-rated', StatsController.topRatedBooks);
router.get('/by-genre', StatsController.booksPerGenre);

module.exports = router;
