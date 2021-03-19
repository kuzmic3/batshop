const fileHelper = require('../helpers/file');

const Product = require('../models/product').Product;
const User = require('../models/user').User;

exports.getProducts = async (req, res, next) => {
    try {
        const products = await Product.find();

        res.status(200).json({
            products: products
        });
    } catch (error) {
        next(new Error('Failed to get products.'));
    }
};

exports.getProductById = async (req, res, next) => {
    const id = req.params.id;

    try {
        const product = await Product.findById(id);

        res.status(200).json({
            product: product
        });
    } catch (error) {
        next(new Error('Failed to get product.'));
    }
};

exports.createProduct = async (req, res, next) => {
    if (req.errors) {
        return res.status(422).json({
            errorMessages: req.errors
        });
    }

    const title = req.body.title;
    const image = req.files.filter(file => file.fieldname === 'image')[0];
    if (!image) {
        return res.status(422).json({
            errorMessages: [{
                param: 'image',
                msg: 'Attached file must be image.'
            }]
        });
    }
    const imageUrl = image.path;
    const price = req.body.price;
    const description = req.body.description;
    const user = req.user;

    const product = new Product({
        title: title,
        imageUrl: imageUrl.replace('public', ''),
        price: price,
        description: description,
        userId: user
    });

    try {
        await product.save();

        res.status(201).json({
            message: 'Product created successfully.',
            product: product
        });
    } catch (error) {
        next(new Error('Failed to create product.'));
    }
};

exports.updateProduct = async (req, res, next) => {
    if (req.errors) {
        return res.status(422).json({
            errorMessages: req.errors
        });
    }

    const id = req.params.id;
    const title = req.body.title;
    const image = req.files.filter(file => file.fieldname === 'image')[0];
    const price = req.body.price;
    const description = req.body.description;

    try {
        const product = await Product.findById(id);

        product.title = title;
        if (image) {
            fileHelper.deleteFile('public' + product.imageUrl);
            product.imageUrl = image.path.replace('public', '');
        }
        product.price = price;
        product.description = description;

        await product.save();

        res.status(200).json({
            message: 'Product updated successfully.',
            product: product
        });
    } catch (error) {
        next(new Error('Failed to update product.'));
    }
};

exports.deleteProduct = async (req, res, next) => {
    const id = req.params.id;

    try {
        const product = await Product.findByIdAndRemove(id);

        const users = await User.find();
        users.forEach(user => {
            user.removeFromCart(product._id);
        });

        fileHelper.deleteFile('public' + product.imageUrl);

        res.status(200).json({
            message: 'Product deleted successfully.'
        });
    } catch (error) {
        next(new Error('Failed to delete product.'));
    }
};
