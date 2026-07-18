import { createAPIFileRoute } from '@tanstack/react-start/api';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16' as any,
});

export const Route = createAPIFileRoute('/api/checkout')({
  POST: async ({ request }) => {
    try {
      const { cartItems } = await request.json();

      const lineItems = cartItems.map((item: any) => {
        // Safely extract price based on your CartItem interface variants structure
        let basePrice = 1199; // Default 8 oz
        if (item.variants?.size === '16 oz') basePrice = 1899;
        if (item.variants?.size === '32 oz') basePrice = 2999;

        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${item.product?.name || 'Nkor Shito Sauce'} (${item.variants?.size || '8 oz'})`,
              description: `Topping: ${item.variants?.protein || 'Plain (No Meat)'}`,
              images: [item.product?.image ? `${new URL(request.url).origin}${item.product.image}` : ''],
            },
            unit_amount: basePrice,
          },
          quantity: item.quantity || 1,
        };
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${new URL(request.url).origin}/?success=true`,
        cancel_url: `${new URL(request.url).origin}/#shop`,
        shipping_address_collection: {
          allowed_countries: ['US'],
        },
      });

      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  },
});
