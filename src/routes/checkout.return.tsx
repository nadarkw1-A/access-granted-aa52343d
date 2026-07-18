import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  return (
    <div className="min-h-screen bg-base-black text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold text-accent-gold">Medaase! Thank you.</h1>
        {session_id ? (
          <p className="text-gray-300">Your order is confirmed. A receipt has been sent to your email.</p>
        ) : (
          <p className="text-gray-300">No session information found.</p>
        )}
        <Link to="/" className="inline-block mt-4 px-6 py-3 bg-accent-orange text-base-black font-bold rounded-xl uppercase tracking-wider">
          Back to Shop
        </Link>
      </div>
    </div>
  );
}
