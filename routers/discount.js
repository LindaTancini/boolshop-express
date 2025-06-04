const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discountController");

// POST /discount/check
router.post("/check", discountController.checkDiscountCode);

module.exports = router;
