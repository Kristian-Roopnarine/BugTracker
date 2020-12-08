const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

router.patch('/updateMe', userController.updateMe);
router.route('/').get(userController.getAllUsers);

module.exports = router;
