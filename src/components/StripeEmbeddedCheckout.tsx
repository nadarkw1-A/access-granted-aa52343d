import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createCartCheckout } from "@/utils/payments.functions";

export interface CartLine {
  productName: string;
  size: string;
  protein: string;
  unitPriceCents: number;
  quantity: number;
}

export function StripeCartCheckout({ cartItems, returnUrl }: { cartItems: CartLine[]; returnUrl: string }) {
  const fetchClientSecret = async (): Promise<string> => {
    const result = await createCartCheckout({
      data: { cartItems, returnUrl, environment: getStripeEnvironment() },
    });
    if ("error" in result) throw new Error(result.error);
    if (!result.clientSecret) throw new Error("Stripe did not return a client secret");
    return result.clientSecret;
  };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
