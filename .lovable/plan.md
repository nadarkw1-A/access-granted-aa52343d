## Goal

Swap the current Stripe embedded checkout for a plain redirect to your external Shopify checkout URL. Only `handleCheckout` inside `CartDrawer` changes. Layout, styles, copy, product data, hero, heritage, images — untouched.

## What I need from you

One thing before I can code this: **the external checkout URL** you want the button to open (e.g. `https://nkoreats.myshopify.com/cart/12345:1` for a Buy Button, or your Shopify Starter storefront/checkout link). If you have per-product links instead of one cart link, tell me — that changes step 2.

## Files I'll touch

1. `src/components/NkorEatsApp.tsx` — only the `CartDrawer` component (lines ~650–786).
2. `.env.development` — add `VITE_SHOPIFY_CHECKOUT_URL` so the URL isn't hardcoded.

Nothing else in `NkorEatsApp.tsx` moves. All other files stay as-is.

## Step-by-step

1. **Add the checkout URL as an env var.** Store your Shopify link in `VITE_SHOPIFY_CHECKOUT_URL` in `.env.development`. Read it in the component with `import.meta.env.VITE_SHOPIFY_CHECKOUT_URL`.

2. **Rewrite `handleCheckout` (lines 655–660).** New behavior:
   - If cart is empty, return.
   - Read the Shopify URL from env; if missing, show a friendly error in the existing `errorMessage` slot.
   - Call `window.location.href = shopifyUrl` (full-page redirect, same tab). No fetch, no modal, no Stripe.

3. **Remove the embedded-checkout modal block (lines 770–786)** and the now-unused `showCheckout` state (line 652), `setShowCheckout` calls, and the `checkoutLines` mapping (lines 662–668). The Stripe modal never opens anymore, so leaving that JSX in would be dead code.

4. **Remove the Stripe import at line 19** (`StripeCartCheckout`) since nothing references it after step 3. I will NOT delete `StripeEmbeddedCheckout.tsx`, `payments.functions.ts`, or the `/checkout/return` route — leaving them in place means zero risk to anything else, and you can rip them out later if you want.

5. **Update the button label at line 764** from `'Connecting to Stripe...'` → keep it as just `'Proceed to Checkout'` (no loading state needed since the browser handles the redirect). The button styling stays identical.

## Technical notes

- The redirect is a client-side `window.location.href` assignment — no server function, no Lovable Cloud, no Shopify API call. Just an anchor navigation in code.
- Cart contents don't get passed to Shopify with a plain redirect. If you want the cart to pre-populate on Shopify's side, you'd need Shopify's permalink cart format (`/cart/VARIANT_ID:QTY,VARIANT_ID:QTY`), which requires each of your products to have a matching Shopify variant ID. Tell me if you want that — it's a small extra step in `handleCheckout` where I build the permalink from `cart` before redirecting.
- After redirect, your Shopify page owns the whole checkout + confirmation flow. The `/checkout/return` page in this app becomes unused (harmless, ignored).

## Explicitly NOT changing

- Hero, product grid, heritage section, footer, images, colors, fonts, animations
- Any file outside `NkorEatsApp.tsx` and `.env.development`
- Product data, prices, spice levels, cart add/remove/quantity logic

Reply with the Shopify URL (and whether you want the cart pre-populated on Shopify) and I'll implement.