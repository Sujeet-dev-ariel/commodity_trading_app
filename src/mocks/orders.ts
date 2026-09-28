import type { Order } from "@/types/domain";

/** Ported from `ORDERS` in Buyer App.html. */
export const PAST_ORDERS: Order[] = [
  { id: "o1", item: "Kabli Chana", seller: "Kunj Bihari Food Industries", bags: 40, price: 8000, date: "6 Aug 2026", status: "Completed" },
  { id: "o2", item: "Matar White", seller: "Rajat SP Co Commodities Pvt Ltd", bags: 25, price: 4850, date: "4 Aug 2026", status: "Completed" },
  { id: "o3", item: "Kabli Chana", seller: "Rajat SP Co Commodities Pvt Ltd", bags: 60, price: 7550, date: "1 Aug 2026", status: "Completed" },
];
