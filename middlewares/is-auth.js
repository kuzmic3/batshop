const jwt = require('jsonwebtoken');

const User = require('../models/user').User;

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;

            throw error;
        }

        const token = req.get('Authorization').split(' ')[1];
        const decodedToken = jwt.verify(token, 'someSecret');
        if (!decodedToken) {
            const error = new Error('Invalid token.');
            error.statusCode = 401;

            throw error;
        }

        const user = await User.findById(decodedToken.userId);
        if (!user) {
            const error = new Error('Invalid token.');
            error.statusCode = 401;

            throw error;
        }

        req.user = user;
    } catch (error) {
        next(new Error(error));
    }

    next();
};
