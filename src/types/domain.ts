/** Domain types ported from the Buyer/Seller HTML prototypes. */

export type Role = "buyer" | "seller";

export type Category = "Besan" | "Dal" | "Matar" | "Chana" | "Rajma" | "Rice";

/** Market listing (buyer browse/home). Price is per-bag rupees. */
export interface Listing {
  id: number;
  category: Category;
  item: string;
  quality: string;
  weight: string;
  seller: string;
  price: number;
}

/** Seller's own listing (dashboard). `price: null` = awaiting today's price. */
export interface SellerListing {
  id: number;
  category: Category;
  item: string;
  weight: string;
  price: number | null;
  featured: boolean;
}

/** Buyer's own posted requirement (buyer home). */
export interface Requirement {
  id: number;
  category: Category;
  item: string;
  weight: string;
  targetPrice: number;
  bags: number;
  status: "Open" | "Closed";
}

/** Buyer requirement as seen by sellers (seller requirements slice). */
export interface BuyerRequirement {
  /** Backend UUID (string) or legacy numeric id — never coerce to number. */
  id: string | number;
  category: Category;
  item: string;
  buyer: string;
  paymentTerms: string;
  targetPrice: number;
  bags: number;
}

/** Completed/past trade. */
export interface Order {
  id: string;
  item: string;
  seller: string;
  bags: number;
  price: number;
  date: string;
  status: string;
}

export interface Offer {
  by: "you" | "them";
  price: number;
  opening?: boolean;
}

/** Active negotiation thread (buyer + seller views). */
export interface Negotiation {
  id: number;
  item: string;
  /** Buyer side links to a listing; seller side links to a requirement. */
  listingId?: number;
  reqId?: number;
  seller?: string;
  buyer?: string;
  statusLabel: string;
  offers: Offer[];
}
