const createError = require('http-errors')

module.exports.error404Handler = (req,res,next) => {
    next(createError(404));
};

module.exports.errorHandler = (err, req, res, next) => {
    if (!res.headersSent) {
        next(createError(404));
    }else {
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        res.status(err.status || 500);
        res.send({ message: err.message})
        console.log("Error producido: " + err);
    }
}

module.exports.headers = (req,res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    next();
}