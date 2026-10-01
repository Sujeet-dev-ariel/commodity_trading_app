import { useCallback, useEffect, useState } from "react";
import { getFriendlyApiError } from "@/core/api/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { listingsApi } from "@/features/seller/listings/api/listingsApi";
import type { Listing } from "@/types/domain";

/** Single own-listing detail via `GET /listings/:id`. */
export function useListingDetail(id: string | undefined) {
  const { session } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError("Listing id is missing.");
      setIsLoading(false);
      return;
    }
    const token = session?.token;
    if (!token) {
      setError("Your session expired. Please sign in again.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setListing(await listingsApi.getById(id, token));
    } catch (e) {
      setError(getFriendlyApiError(e, "Could not load this listing"));
    } finally {
      setIsLoading(false);
    }
  }, [id, session?.token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { listing, isLoading, error, retry: load };
}
