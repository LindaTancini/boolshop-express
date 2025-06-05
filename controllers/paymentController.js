// backend/controllers/paymentController.js
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { cart, shippingCost, discountResult } = req.body;

    const line_items = [
      ...cart.map(item => ({
        price_data: {
          currency: "eur",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      })),
      {
        price_data: {
          currency: "eur",
          product_data: { name: "Spedizione" },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      }
    ];

    const sessionParams = {
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      shipping_address_collection: { allowed_countries: ["IT"] },
      success_url: `${process.env.FE_APP}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FE_APP}/cancel`,
      metadata: {
        discountCode: discountResult.code || "",
      },
    };

    if (discountResult && discountResult.code) {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.json({ url: session.url });
  } catch (err) {
    return res.status(500).json({ error: "Errore durante la creazione della sessione Stripe" });
  }
};
