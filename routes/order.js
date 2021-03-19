const express = require('express');

const isAuth = require('../middlewares/is-auth.js');

const orderController = require('../controllers/orderController');

const router = express.Router();

router.get('/', isAuth, orderController.getOrders);

router.post('/', isAuth, orderController.createOrder);

router.get('/invoices/:id', isAuth, orderController.getInvoice);

module.exports = router;
