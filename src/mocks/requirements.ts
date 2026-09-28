import type { BuyerRequirement, Requirement } from "@/types/domain";

/** Ported from `INITIAL_MY_REQUIREMENTS` in Buyer App.html. */
export const MY_REQUIREMENTS: Requirement[] = [
  { id: 1, category: "Chana", item: "Kabli Chana", weight: "30KG", targetPrice: 7200, bags: 40, status: "Open" },
];

/** Ported from `BUY_REQUIREMENTS` in Seller App.html (as seen by sellers). */
export const BUYER_REQUIREMENTS: BuyerRequirement[] = [
  { id: 1, category: "Chana", item: "Kabli Chana", buyer: "Mohd Akbar Farooq Ahmad", paymentTerms: "10-15 days", targetPrice: 7800, bags: 50 },
  { id: 2, category: "Matar", item: "Matar White", buyer: "GH Mohi-ud-Din Mir & Co", paymentTerms: "15-20 days", targetPrice: 4700, bags: 30 },
  { id: 3, category: "Rajma", item: "Disco", buyer: "Mohd Akbar Farooq Ahmad", paymentTerms: "10-15 days", targetPrice: 12300, bags: 20 },
  { id: 4, category: "Chana", item: "Kabli Chana", buyer: "Ismail Enterprises", paymentTerms: "8-10 days", targetPrice: 7200, bags: 40 },
];
