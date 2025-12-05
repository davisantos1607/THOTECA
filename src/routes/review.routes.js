const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/review.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, ReviewController.create);
router.get('/book/:bookId', ReviewController.listByBook);
router.delete('/:id', auth, ReviewController.delete);

module.exports = router;
