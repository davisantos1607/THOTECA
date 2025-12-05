const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favorite.controller');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, FavoriteController.add);
router.get('/', auth, FavoriteController.list);
router.delete('/:book_id', auth, FavoriteController.remove);

module.exports = router;
