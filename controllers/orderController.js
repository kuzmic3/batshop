const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Order = require('../models/order').Order;

exports.getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({'user.id': req.user._id});

        res.status(200).json({
            orders: orders
        });
    } catch (error) {
        next(new Error('Failed to get orders.'));
    }
};

exports.createOrder = async (req, res, next) => {
    try {
        const user = await req.user.populate('cart.items.productId').execPopulate();

        let totalSum = 0;
        user.cart.items.forEach(item => {
            totalSum += item.quantity * item.productId.price;
        });

        const products = user.cart.items.map(item => {
            return {
                quantity: item.quantity,
                product: {...item.productId._doc}
            };
        });

        const order = new Order({
            user: {
                email: req.user.email,
                id: req.user
            },
            products: products
        });

        await order.save();

        const invoiceName = 'invoice-' + order._id + '.pdf';
        const invoicePath = path.join('public', 'invoices', invoiceName);

        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));

        pdfDoc.fontSize(26).text('Invoice', {
            underline: true
        });
        pdfDoc.text('-----------------------');
        order.products.forEach(item => {
            pdfDoc.fontSize(14).text(
                item.product.title +
                ' - ' +
                item.quantity +
                ' x ' +
                '$' +
                item.product.price
            );
        });
        pdfDoc.text('---');
        pdfDoc.fontSize(20).text('Total Price: $' + totalSum);

        pdfDoc.end();

        await req.user.clearCart();

        res.status(200).json({
            message: 'Order created successfully.',
            order: order
        });
    } catch (error) {
        next(new Error('Failed to create order.'));
    }
};

exports.getInvoice = async (req, res, next) => {
    const id = req.params.id;

    try {
        const order = await Order.findById(id);

        if (!order) {
            return next(new Error('No order found.'));
        }

        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next(new Error('Unauthorized.'));
        }
    } catch (error) {
        next('Failed to get invoice.');
    }

    const invoiceName = 'invoice-' + id + '.pdf';
    const invoicePath = path.join('invoices', invoiceName);

    res.status(200).json({
        url: invoicePath
    });
};
