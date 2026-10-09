import { ListingDetailScreen } from "@/features/buyer/browse/screens/ListingDetailScreen";

/**
 * Thin route — buyer listing detail (Buyer App.html detail screen),
 * opened by tapping a browse card. Nested in the browse tab stack so
 * the bottom bar stays visible.
 */
export default function BrowseListingDetailRoute() {
  return <ListingDetailScreen />;
}
