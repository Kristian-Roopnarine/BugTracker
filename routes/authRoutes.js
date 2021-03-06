const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/signup', authController.signup);

router.route('/').get(userController.getAllUsers);

module.exports = router;
