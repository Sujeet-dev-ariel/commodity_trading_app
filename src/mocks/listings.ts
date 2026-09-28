import type { Category, Listing, SellerListing } from "@/types/domain";

/** Ported from `CATEGORIES` in Buyer App.html. */
export const CATEGORIES: ("All" | Category)[] = [
  "All",
  "Besan",
  "Dal",
  "Matar",
  "Chana",
  "Rajma",
  "Rice",
];

/** Ported from `LISTINGS` in Buyer App.html. Prices are per-bag rupees. */
export const MARKET_LISTINGS: Listing[] = [
  // Besan
  { id: 1, category: "Besan", item: "Besan", quality: "Mota", weight: "35KG", seller: "Kuber Marketing", price: 2630 },
  { id: 2, category: "Besan", item: "Besan", quality: "Barik", weight: "35KG", seller: "Jagdish Food Industries", price: 2710 },
  // Chana → Kabli Chana
  { id: 3, category: "Chana", item: "Kabli Chana", quality: "48-50", weight: "30KG", seller: "Rajat SP Co Commodities Pvt Ltd", price: 7550 },
  { id: 4, category: "Chana", item: "Kabli Chana", quality: "54-56", weight: "30KG", seller: "Kunj Bihari Food Industries", price: 7900 },
  { id: 5, category: "Chana", item: "Kabli Chana", quality: "58-60", weight: "30KG", seller: "Nagesh Trading Co", price: 8200 },
  // Dal → Dal Chana
  { id: 6, category: "Dal", item: "Dal Chana", quality: "Bold", weight: "30KG", seller: "J D Enterprises", price: 6200 },
  { id: 7, category: "Dal", item: "Dal Chana", quality: "Small", weight: "30KG", seller: "Guru Har Sahai Traders", price: 5900 },
  // Dal → Malka Masoor
  { id: 8, category: "Dal", item: "Malka Masoor", quality: "Dry", weight: "30KG", seller: "Rajat SP Co Commodities Pvt Ltd", price: 6650 },
  { id: 9, category: "Dal", item: "Malka Masoor", quality: "Normal", weight: "30KG", seller: "Jagdish Food Industries", price: 6400 },
  // Dal → Moong
  { id: 10, category: "Dal", item: "Moong", quality: "Full Green", weight: "30KG", seller: "MM Agro Food Pvt Ltd", price: 9450 },
  { id: 11, category: "Dal", item: "Moong", quality: "Normal", weight: "30KG", seller: "Kuber Marketing", price: 9100 },
  // Matar → Matar White
  { id: 12, category: "Matar", item: "Matar White", quality: "Bold", weight: "30KG", seller: "Rajat SP Co Commodities Pvt Ltd", price: 4850 },
  { id: 13, category: "Matar", item: "Matar White", quality: "Medium", weight: "30KG", seller: "Kuber Marketing", price: 4600 },
  // Matar → Dall
  { id: 14, category: "Matar", item: "Dall", quality: "Bold", weight: "30KG", seller: "MH Food Products Co", price: 5250 },
  { id: 15, category: "Matar", item: "Dall", quality: "Small", weight: "30KG", seller: "Nagesh Trading Co", price: 5000 },
  // Rajma → Disco
  { id: 16, category: "Rajma", item: "Disco", quality: "Bihar", weight: "30KG", seller: "Rajat SP Co Commodities Pvt Ltd", price: 12600 },
  { id: 17, category: "Rajma", item: "Disco", quality: "Other", weight: "30KG", seller: "J D Enterprises", price: 12300 },
  // Rajma → Black
  { id: 18, category: "Rajma", item: "Black", quality: "", weight: "30KG", seller: "Guru Har Sahai Traders", price: 11800 },
  // Rajma → Bohon
  { id: 19, category: "Rajma", item: "Bohon", quality: "White", weight: "30KG", seller: "Rajat SP Co Commodities Pvt Ltd", price: 12300 },
  { id: 20, category: "Rajma", item: "Bohon", quality: "Normal", weight: "30KG", seller: "Kunj Bihari Food Industries", price: 12000 },
  // Rajma → Red
  { id: 21, category: "Rajma", item: "Red", quality: "Madras", weight: "30KG", seller: "MM Agro Food Pvt Ltd", price: 13200 },
  { id: 22, category: "Rajma", item: "Red", quality: "Imported", weight: "30KG", seller: "MH Food Products Co", price: 13600 },
  // Rice
  { id: 23, category: "Rice", item: "UP", quality: "Mota", weight: "30KG", seller: "Jagdish Food Industries", price: 3150 },
  { id: 24, category: "Rice", item: "UP", quality: "Parmal", weight: "30KG", seller: "Kuber Marketing", price: 3320 },
  { id: 25, category: "Rice", item: "KunjBihari", quality: "Others", weight: "30KG", seller: "Kunj Bihari Food Industries", price: 3480 },
  { id: 26, category: "Rice", item: "KunjBihari", quality: "Steam", weight: "30KG", seller: "Kunj Bihari Food Industries", price: 3650 },
  { id: 27, category: "Rice", item: "Double Chabi", quality: "Others", weight: "30KG", seller: "MM Agro Food Pvt Ltd", price: 3900 },
  { id: 28, category: "Rice", item: "Glaxy", quality: "Steam", weight: "30KG", seller: "MH Food Products Co", price: 4200 },
  { id: 29, category: "Rice", item: "Glaxy", quality: "Sella", weight: "30KG", seller: "Nagesh Trading Co", price: 4450 },
];

/**
 * Ported from `INITIAL_LISTINGS` in Seller App.html.
 * `price: null` = yesterday's listing kept, waiting on today's price.
 */
export const SELLER_LISTINGS: SellerListing[] = [
  { id: 1, category: "Rajma", item: "Disco", weight: "30KG", price: 12600, featured: false },
  { id: 2, category: "Rajma", item: "Bohon", weight: "30KG", price: 12300, featured: false },
  { id: 7, category: "Rajma", item: "Red", weight: "30KG", price: 7800, featured: true },
  { id: 8, category: "Rice", item: "UP", weight: "30KG", price: 3150, featured: false },
  { id: 9, category: "Rice", item: "Glaxy", weight: "30KG", price: 4200, featured: true },
  { id: 3, category: "Chana", item: "Kabli Chana", weight: "30KG", price: 7550, featured: false },
  { id: 4, category: "Chana", item: "Kabli Chana", weight: "30KG", price: 8000, featured: false },
  { id: 8, category: "Chana", item: "Kabli Chana", weight: "30KG", price: 7350, featured: true },
  { id: 5, category: "Matar", item: "Matar White", weight: "30KG", price: 4850, featured: false },
  { id: 6, category: "Dal", item: "Malka Masoor", weight: "30KG", price: null, featured: false },
];
