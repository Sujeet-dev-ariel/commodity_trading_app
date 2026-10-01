import { useCallback, useEffect, useMemo, useState } from "react";
import { getFriendlyApiError } from "@/core/api/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { listingsApi } from "@/features/seller/listings/api/listingsApi";
import type { Listing } from "@/types/domain";

export interface HomeRow {
  id: number | string;
  category: string;
  item: string;
  weight: string;
  /** Null = awaiting today's price (backend sends 0/missing). */
  price: number | null;
}

/** `0`/missing prices are "awaiting today's price", never a real ₹0 quote. */
function toHomeRow(l: Listing): HomeRow {
  return {
    id: l.id as number | string,
    category: l.category,
    item: l.item,
    weight: l.weight,
    price: l.price > 0 ? l.price : null,
  };
}

/** Human countdown to the next 2:00 AM price reset (prototype `expiryLabel`). */
function timeUntil2AM(now = new Date()): string {
  const reset = new Date(now);
  reset.setHours(2, 0, 0, 0);
  if (reset.getTime() <= now.getTime()) reset.setDate(reset.getDate() + 1);
  const mins = Math.max(1, Math.round((reset.getTime() - now.getTime()) / 60000));
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`;
}

/**
 * Seller home data (Seller App.html `isHome`): today's own listings via
 * `GET /listings?side=SELL`, live/priced counts, and the 2 AM expiry state.
 */
export function useSellerHome() {
  const { session } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = session?.token;
    if (!token) {
      setError("Your session expired. Please sign in again.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setListings(await listingsApi.list(token));
    } catch (e) {
      setError(getFriendlyApiError(e, "Could not load today's listings"));
    } finally {
      setIsLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const rows = useMemo(() => listings.map(toHomeRow), [listings]);
  const liveCount = rows.length;
  const pricedCount = useMemo(
    () => rows.filter((r) => r.price !== null).length,
    [rows],
  );
  // At 2 AM prices clear: rows kept, all awaiting fresh prices.
  const expired = liveCount > 0 && pricedCount === 0;
  const expiryLabel = expired
    ? "Expired at 2 AM"
    : `Prices expire in ${timeUntil2AM()}`;

  return {
    firmName: session?.user?.firmName ?? "",
    rows,
    liveCount,
    pricedCount,
    expired,
    expiryLabel,
    isLoading,
    error,
    retry: load,
  };
}
