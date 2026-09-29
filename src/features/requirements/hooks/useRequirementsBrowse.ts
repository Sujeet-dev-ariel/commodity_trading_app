import { useMemo, useState } from "react";
import { CATEGORIES } from "@/mocks/listings";
import { BUYER_REQUIREMENTS } from "@/mocks/requirements";
import { bagsLabel, priceLabel } from "@/core/utils/format";
import type { BuyerRequirement, Category } from "@/types/domain";

export type ReqMode = "commodity" | "buyer";
export type ReqCategory = "All" | Category;

export interface RequirementRow extends BuyerRequirement {
  priceText: string;
  wantsText: string;
  paysText: string;
}

export interface BuyerGroup {
  buyer: string;
  rows: RequirementRow[];
}

function toRow(r: BuyerRequirement, hideBuyer: boolean): RequirementRow {
  return {
    ...r,
    priceText: priceLabel(r.targetPrice),
    wantsText: hideBuyer ? `wants ${bagsLabel(r.bags)}` : `${r.buyer} · wants ${bagsLabel(r.bags)}`,
    paysText: `Pays in ${r.paymentTerms}`,
  };
}

/**
 * Seller buyer-requirements data (Seller App.html `isRequirements`):
 * By Commodity rows with category chips, By Buyer sections with name search.
 * Rows open negotiation next slice. Mock-first.
 */
export function useRequirementsBrowse() {
  const [mode, setMode] = useState<ReqMode>("commodity");
  const [category, setCategory] = useState<ReqCategory>("All");
  const [buyerSearch, setBuyerSearch] = useState("");
  const [collapsed, setCollapsed] = useState<readonly string[]>([]);

  const rows = useMemo(
    () =>
      (category === "All" ? BUYER_REQUIREMENTS : BUYER_REQUIREMENTS.filter((r) => r.category === category)).map(
        (r) => toRow(r, false),
      ),
    [category],
  );

  const buyerGroups = useMemo(() => {
    const q = buyerSearch.trim().toLowerCase();
    return [...new Set(BUYER_REQUIREMENTS.map((r) => r.buyer))]
      .sort()
      .filter((name) => !q || name.toLowerCase().includes(q))
      .map<BuyerGroup>((buyer) => ({
        buyer,
        rows: BUYER_REQUIREMENTS.filter((r) => r.buyer === buyer).map((r) => toRow(r, true)),
      }));
  }, [buyerSearch]);

  function toggleBuyer(buyer: string) {
    setCollapsed((prev) => (prev.includes(buyer) ? prev.filter((b) => b !== buyer) : [...prev, buyer]));
  }

  return {
    categories: CATEGORIES,
    mode,
    setMode,
    category,
    setCategory,
    buyerSearch,
    setBuyerSearch,
    rows,
    buyerGroups,
    collapsed,
    toggleBuyer,
  };
}
