import { useMemo, useState } from "react";
import { CATEGORIES, MARKET_LISTINGS } from "@/mocks/listings";
import { priceLabel } from "@/core/utils/format";
import type { Category, Listing } from "@/types/domain";

export type BrowseMode = "commodity" | "seller";
export type BrowseCategory = "All" | Category;

export interface BrowseRow extends Listing {
  priceText: string;
  qualityText: string;
}

export interface BrowseGroup {
  key: string;
  category: Category;
  item: string;
  weight: string;
  rows: BrowseRow[];
}

export interface SellerGroup {
  seller: string;
  itemGroups: BrowseGroup[];
}

/** Group listings by category/item (prototype `groupByItem`): groups sorted, rows cheapest first. */
function groupByItem(list: Listing[]): BrowseGroup[] {
  const map = new Map<string, BrowseGroup>();
  for (const l of list) {
    const key = `${l.category} / ${l.item}`;
    const existing = map.get(key);
    if (existing) {
      existing.rows.push(toRow(l));
    } else {
      map.set(key, { key, category: l.category, item: l.item, weight: l.weight, rows: [toRow(l)] });
    }
  }
  return [...map.values()]
    .sort((a, b) => a.category.localeCompare(b.category) || a.item.localeCompare(b.item))
    .map((g) => ({ ...g, rows: g.rows.sort((a, b) => a.price - b.price) }));
}

function toRow(l: Listing): BrowseRow {
  return { ...l, priceText: priceLabel(l.price), qualityText: l.quality || "Standard" };
}

/**
 * Buyer browse data (Buyer App.html `isBrowse`): By Commodity groups with
 * category chips, By Seller sections with name search. Mock-first.
 */
export function useBrowse() {
  const [mode, setMode] = useState<BrowseMode>("commodity");
  const [category, setCategory] = useState<BrowseCategory>("All");
  const [sellerSearch, setSellerSearch] = useState("");
  const [collapsed, setCollapsed] = useState<readonly string[]>([]);

  const groups = useMemo(
    () =>
      groupByItem(
        category === "All" ? MARKET_LISTINGS : MARKET_LISTINGS.filter((l) => l.category === category),
      ),
    [category],
  );

  const sellerGroups = useMemo(() => {
    const q = sellerSearch.trim().toLowerCase();
    return [...new Set(MARKET_LISTINGS.map((l) => l.seller))]
      .sort()
      .filter((name) => !q || name.toLowerCase().includes(q))
      .map<SellerGroup>((seller) => ({
        seller,
        itemGroups: groupByItem(MARKET_LISTINGS.filter((l) => l.seller === seller)),
      }));
  }, [sellerSearch]);

  function toggleSeller(seller: string) {
    setCollapsed((prev) => (prev.includes(seller) ? prev.filter((s) => s !== seller) : [...prev, seller]));
  }

  return {
    categories: CATEGORIES,
    mode,
    setMode,
    category,
    setCategory,
    sellerSearch,
    setSellerSearch,
    groups,
    sellerGroups,
    collapsed,
    toggleSeller,
  };
}
