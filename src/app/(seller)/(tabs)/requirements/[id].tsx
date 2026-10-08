import { NegotiateScreen } from "@/features/seller/negotiation/screens/NegotiateScreen";

/**
 * Thin route — seller Negotiate page (Seller App.html `isNegotiate`),
 * opened by tapping a buyer-requirement card. Nested in the requirements
 * tab stack so the bottom bar stays visible.
 */
export default function RequirementNegotiateRoute() {
  return <NegotiateScreen />;
}
