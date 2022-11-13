const jwt = require("jsonwebtoken");

// decode token

module.exports = function (req, res, next) {
     try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.jwt_secret);
        req.body.userId = decoded.userId;
        next();
     } catch (error) {
        res.send({
           message: error.message,
           success: false,
        });
     }
}