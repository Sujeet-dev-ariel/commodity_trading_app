import { AddListingScreen } from "@/features/seller/listings/screens/AddListingScreen";

/**
 * Thin route — the listing form, opened from the dashboard's "Add listing"
 * button (Seller App.html `goAdd`). Lives inside the tabs navigator so the
 * bottom bar stays visible with the Add listing tab highlighted.
 */
export default function AddListingFormRoute() {
  return <AddListingScreen />;
}
