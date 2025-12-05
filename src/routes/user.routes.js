const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');

router.get('/me', auth, UserController.getProfile);
router.put('/me', auth, UserController.updateProfile);
router.delete('/me', auth, UserController.deleteAccount);

module.exports = router;
