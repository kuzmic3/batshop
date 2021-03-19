const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');

const productRoutes = require('./routes/product');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const app = express();

app.use(multer({ storage: fileStorage }).any());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
});

app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/', authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).json({
        error: error.toString()
    });
});

try {
    mongoose.connect('mongodb+srv://kuzmic3:Quantoxsk1-@cluster0-ya3x1.mongodb.net/batshop', { useNewUrlParser: true }).then(() => {
        app.listen(8000);
    });
} catch (error) {
    console.log(error);
}
