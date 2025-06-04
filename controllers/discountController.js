const db = require('../data/db').promise();

exports.checkDiscountCode = async (req, res) => {
  const { code, orderTotal, shippingCost } = req.body;
  if (!code) return res.status(400).json({ valid: false, message: 'Codice mancante' });

  try {
    // Cerca il codice sconto valido per data
    const sql = `
      SELECT 
        * 
      FROM 
        discount_code 
      WHERE 
        code IS NOT NULL 
      AND 
        start_date <= CURDATE() 
      AND 
        end_date >= CURDATE() 
      AND 
        BINARY code = ? LIMIT 1
    `;

    const [rows] = await db.query(sql, [code]);

    if (!rows.length)
      return res.json({ valid: false, message: 'Codice sconto non valido o scaduto' });

    const discount = rows[0];
    let discountValue = 0;
    let newTotal = orderTotal;
    let newShippingCost = shippingCost;
    let message = '';

    if (discount.amount == null)
      return res.json({ valid: false, message: 'Codice sconto non valido' });


    if (discount.type === 'percentuale') {
      discountValue = (orderTotal * discount.amount) / 100;
      newTotal = orderTotal - discountValue;
      message = `Sconto del ${discount.amount}% applicato!`;
    } else if (discount.type === 'quota_fissa') {
      discountValue = discount.amount;
      newTotal = orderTotal - discountValue;
      message = `Sconto di €${discount.amount} applicato!`;
    } else if (discount.type === 'spedizione_gratis') {
      newShippingCost = 0;
      message = 'Spedizione gratuita applicata!';
    } else {
      return res.json({ valid: false, message: 'Tipo di codice sconto non gestito' });
    }

    if (newTotal < 0)
      newTotal = 0;

    return res.json({
      valid: true,
      type: discount.type,
      amount: discount.amount,
      discount: discountValue,
      newTotal,
      newShippingCost,
      message
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ valid: false, message: 'Errore server' });
  }
};
