const errorHandler = (err, req, res, next) => {
    res.status(500);
    res.json({

        error: "Internal server error",
        message: "si è verificato un errore interno al server"

    });
}

module.exports = errorHandler;