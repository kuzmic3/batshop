const bcript = require('bcryptjs');
const {body} = require('express-validator/check');

const User = require('../models/user').User;

exports.login = [
    body('email', 'Please enter a valid email.')
        .isEmail()
        .custom(async (value, {req}) => {
            const user = await User.findOne({email: value});
            if (!user) {
                throw new Error('Email does not exists.');
            }

            const result = await bcript.compare(req.body.password, user.password);
            if (!result) {
                throw new Error('Invalid password.');
            }
        })
];

exports.register = [
    body('email', 'Please enter a valid email.')
        .isEmail()
        .custom(async (value, {req}) => {
            const user = await User.findOne({email: value});

            if (user) {
                throw new Error('This email already exists.');
            } else {
                return true;
            }
        }),

    body('password', 'Please enter a password with only numbers and text and at least 6 characters.')
        .isLength({min: 5})
        .isAlphanumeric(),

    body('confirmPassword')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match.');
            }

            return true;
        })
];

exports.resetPassword = [
    body('email', 'Email is incorrect.')
        .isEmail()
        .custom(async (value, {req}) => {
            const user = await User.findOne({email: value});

            if (!user) {
                throw new Error();
            }

            return true;
        })
];

exports.newPassword = [
    body('token', 'Wrong token.')
        .custom(async (value, {req}) => {
            const user = await User.findOne({
                resetToken: value,
                resetTokenExpiration: {$gt: Date.now()}
            });

            if (!user) {
                throw new Error();
            }

            return true;
        }),

    body('password', 'Please enter a password with only numbers and text and at least 6 characters.')
        .isLength({min: 5})
        .isAlphanumeric(),

    body('confirmPassword')
        .custom((value, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Passwords have to match.');
            }

            return true;
        })
];
