const notFound = (req, res, next) => {
    res.status(404).json({
        error: "not found",
        messaggio: "endpoint inesistente",
    });
};


module.exports = notFound;