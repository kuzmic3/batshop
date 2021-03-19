const express = require('express');

const isAuth = require('../middlewares/is-auth.js');

const productValidator = require('../validators/product');

const errorHandler = require('../helpers/error-handler');

const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', isAuth, productValidator.createProduct, errorHandler, productController.createProduct);
router.patch('/:id', isAuth, productValidator.updateProduct, errorHandler, productController.updateProduct);
router.delete('/:id', isAuth, productController.deleteProduct);

module.exports = router;
