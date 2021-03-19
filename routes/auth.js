const express = require('express');

const validator = require('../validators/auth');

const errorHandler = require('../helpers/error-handler');

const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', validator.login, errorHandler, authController.postLogin);

router.post('/register', validator.register, errorHandler, authController.postRegister);

router.post('/reset-password', validator.resetPassword, errorHandler, authController.postResetPassword);

router.post('/new-password', validator.newPassword, errorHandler, authController.postNewPassword);

module.exports = router;
