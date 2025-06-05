const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Crea sessione checkout
router.post("/create-checkout-session", paymentController.createCheckoutSession);

// ✅ AGGIUNTA QUESTA ROTTA: Recupera dati sessione da Stripe
router.get("/session", paymentController.getSession);

module.exports = router;