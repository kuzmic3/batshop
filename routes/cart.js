const express = require('express');

const isAuth = require('../middlewares/is-auth.js');

const cartController = require('../controllers/cartController');

const router = express.Router();

router.get('/', isAuth, cartController.getCart);

router.post('/add-to-cart/:id', isAuth, cartController.addToCart);

router.delete('/delete-from-cart/:id', isAuth, cartController.deleteFromCart);

module.exports = router;
