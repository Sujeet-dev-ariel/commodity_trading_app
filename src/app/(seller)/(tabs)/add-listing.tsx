import { SellerHomeScreen } from "@/features/seller/home/screens/SellerHomeScreen";

/**
 * Thin route — the Add listing tab serves the Today's-listings dashboard
 * (Seller App.html: the tab runs `backHome`). The form opens from the
 * dashboard's "Add listing" button (`add-listing-form`).
 */
export default function AddListingRoute() {
  return <SellerHomeScreen />;
}
