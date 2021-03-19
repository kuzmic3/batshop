const {body} = require('express-validator/check');

exports.createProduct = [
    body('title', 'Title must have at least 3 characters.')
        .isLength({min: 3}),

    body('price', 'Price must be decimal number.')
        .isFloat(),

    body('description', 'Description must between 5 and 400 characters.')
        .isLength({min: 5, max: 400})
];

exports.updateProduct = [
    body('title', 'Title must have at least 3 characters.')
        .isLength({min: 3}),

    body('price', 'Price must be decimal number.')
        .isFloat(),

    body('description', 'Description must between 5 and 400 characters.')
        .isLength({min: 5, max: 400})
];
