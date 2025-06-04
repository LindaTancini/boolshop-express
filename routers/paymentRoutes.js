const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// POST /payment/create-checkout-session
router.post("/create-checkout-session", paymentController.createCheckoutSession);

module.exports = router;
