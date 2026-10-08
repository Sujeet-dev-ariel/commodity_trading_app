import { AddListingScreen } from "@/features/seller/listings/screens/AddListingScreen";

/**
 * Thin route — the listing form, opened from the dashboard's "Add listing"
 * button. Lives in the seller Stack (not in tabs) so `router.back()`
 * returns to the previous page (Today's listings dashboard) instead of
 * falling back to the tabs' initial Browse route.
 */
export default function AddListingFormRoute() {
  return <AddListingScreen />;
}
