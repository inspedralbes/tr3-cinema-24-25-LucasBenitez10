const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Añade esto en tu archivo .env

// Endpoint para crear intención de pago
router.post('/create-payment-intent', async (req, res) => {
    try {
      const { amount, currency = 'mxn', metadata = {} } = req.body;
      
      if (!amount) {
        return res.status(400).json({ error: 'Se requiere un monto para el pago' });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convertir a centavos
        currency,
        metadata,
        payment_method_types: ['card'],
      });
      
    

      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error) {
      console.error('Error al crear PaymentIntent:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Endpoint para confirmar que el pago fue exitoso (webhook)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
   
  }

  res.json({received: true});
});

module.exports = router;