const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.createCheckoutSession = async (req, res) => {
  try {
    const { cart, payment: customer, shippingCost, discountResult } = req.body;

    let promotionCodeId = null;

    console.log(discountResult);
    if (discountResult && discountResult.code) {
      try {
        const promoList = await stripe.promotionCodes.list({
          code: discountResult.code,
          active: true,
          limit: 1,
        });

        if (promoList.data && promoList.data.length > 0) {
          promotionCodeId = promoList.data[0].id;
        } else {
          console.warn("Promotion Code non trovato o non valido:", discountResult.code);
        }
      } catch (err) {
        console.warn("Errore durante il recupero del Promotion Code:", err);
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
      success_url: `${process.env.FE_APP}/`,
      cancel_url: `${process.env.FE_APP}/cancel`,
      metadata: {
        discountCode: discountResult.code || "",
      },
    };

    if (promotionCodeId)
      sessionParams.discounts = [{ promotion_code: promotionCodeId }];

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({ url: session.url });
  } catch (err) {
    console.error("Errore durante la creazione della sessione Stripe:", err);
    res.status(500).json({ error: "Errore durante la creazione della sessione Stripe" });
  }
};
