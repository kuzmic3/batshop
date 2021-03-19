const Product = require('../models/product').Product;

exports.getCart = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId').execPopulate();

        const items = user.cart.items;

        res.status(200).json({
            items: items
        });
    } catch (error) {
        next(new Error('Failed to get cart items.'));
    }
};

exports.addToCart = async (req, res, next) => {
    const id = req.params.id;

    try {
        const product = await Product.findById(id);

        await req.user.addToCart(product);

        res.status(200).json({
            message: 'Product added successfully.'
        });
    } catch (error) {
        next(new Error('Failed to add product.'));
    }
};

exports.deleteFromCart = async (req, res, next) => {
    const id = req.params.id;

    try {
        await req.user.removeFromCart(id);

        res.status(200).json({
            message: 'Product deleted successfully.'
        });
    } catch (error) {
        next(new Error('Failed to delete product.'));
    }
};
