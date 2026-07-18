import { createServerFn } from "@tanstack/react-start";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

type CartInput = {
  cartItems: Array<{
    productName: string;
    size: string;
    protein: string;
    unitPriceCents: number;
    quantity: number;
  }>;
  returnUrl: string;
  environment: StripeEnv;
};

type CheckoutResult = { clientSecret: string } | { error: string };

export const createCartCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: CartInput) => {
    if (!Array.isArray(data.cartItems) || data.cartItems.length === 0) {
      throw new Error("Cart is empty");
    }
    for (const item of data.cartItems) {
      if (!item.productName || !item.size || !item.protein) throw new Error("Invalid cart item");
      if (!Number.isInteger(item.unitPriceCents) || item.unitPriceCents < 50) throw new Error("Invalid price");
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error("Invalid quantity");
    }
    if (typeof data.returnUrl !== "string" || !/^https?:\/\//.test(data.returnUrl)) throw new Error("Invalid returnUrl");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid environment");
    return data;
  })
  .handler(async ({ data }): Promise<CheckoutResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.create({
        line_items: data.cartItems.map((item) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: `${item.productName} (${item.size})`,
              description: `Topping: ${item.protein}`,
            },
            unit_amount: item.unitPriceCents,
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        shipping_address_collection: { allowed_countries: ["US"] },
      });
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
