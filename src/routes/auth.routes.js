const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { body } = require('express-validator');

router.post('/register',
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password too short'),
    AuthController.register
);

router.post('/login', AuthController.login);

module.exports = router;
