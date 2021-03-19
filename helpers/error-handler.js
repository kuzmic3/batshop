const {validationResult} = require('express-validator/check');

module.exports = (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        req.errors = error.array();
    }

    next();
};
