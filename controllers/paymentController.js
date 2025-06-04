const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { cart, payment: customer, shippingCost, discountResult } = req.body;

    console.log(discountResult);

    let coupon;
    if (discountResult.code) {
      try {
        coupon = await stripe.coupons.retrieve(discountResult.code);
      } catch (err) {
        console.warn("Coupon non trovato o non valido:", discountResult.code);
      }
    }

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
      customer_email: customer.email,
      success_url: `${process.env.FE_APP}/success`,
      cancel_url: `${process.env.FE_APP}/cancel`,
      metadata: {
        discountCode: discountResult.code || "",
      },
    };

    if (coupon)
      sessionParams.discounts = [{ coupon }];

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Errore durante la creazione della sessione Stripe" });
  }
};