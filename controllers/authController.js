const bcript = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../models/user').User;

const mailTransporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: 'b7bd08bec570e1',
        pass: '8a0f7b5e444a75'
    }
});

exports.postLogin = async (req, res, next) => {
    if (req.errors) {
        return res.status(422).json({
            errorMessages: req.errors
        });
    }

    const email = req.body.email;

    try {
        const user = await User.findOne({email: email});
        const token = jwt.sign(
            {
                email: email,
                userId: user._id.toString()
            },
            'someSecret',
            {expiresIn: '1h'}
        );

        return res.status(200).json({
            token: token,
            userId: user._id.toString()
        });
    } catch (error) {
        next(new Error(error));
    }
};

exports.postRegister = async (req, res, next) => {
    if (req.errors) {
        return res.status(422).json({
            errorMessages: req.errors
        });
    }

    const email = req.body.email;
    const password = req.body.password;

    const hashedPassword = await bcript.hash(password, 12);

    const newUser = new User({
        email: email,
        password: hashedPassword,
        cart: {
            items: []
        }
    });

    await newUser.save();

    mailTransporter.sendMail({
        from: 'auth@batshop.com',
        to: email,
        subject: 'Sing up succeeded',
        html: '<h1>You successfully singed up!</h1>'
    });

    res.status(200).json({
        message: 'User registered successfully.',
        user: newUser
    });
};

exports.postResetPassword = (req, res, next) => {
    if (req.errors) {
        return res.status(422).json({
            errorMessages: req.errors
        });
    }

    const email = req.body.email;
    crypto.randomBytes(32, async (error, buffer) => {
        if (error) {
            next(new Error('Please, try again.'));
        }

        const token = buffer.toString('hex');

        try {
            const user = await User.findOne({email: email});

            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;

            user.save();

            mailTransporter.sendMail({
                from: 'auth@batshop.com',
                to: email,
                subject: 'Password reset',
                html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:8000/new-password/${token}">link</a> to set a new password</p>
                `
            });

            res.status(200).json({
                message: 'We send a reset password link to your email.'
            });
        } catch (error) {
            next(new Error('Failed to send a reset password link.'));
        }
    });
};
exports.postNewPassword = async (req, res, next) => {
    if (req.errors) {
        return res.status(422).json({
            errorMessages: req.errors
        });
    }

    const password = req.body.password;
    const token = req.body.token;

    try {
        const user = await User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}});

        user.password = await bcript.hash(password, 12);
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();

        res.status(200).json({
            message: 'Your password changed successfully.'
        });
    } catch (error) {
        next(new Error('Failed to change password.'));
    }
};
