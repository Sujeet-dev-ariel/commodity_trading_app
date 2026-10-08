import { useCallback, useEffect, useMemo, useState } from "react";
import { getFriendlyApiError } from "@/core/api/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { listingsApi } from "@/features/seller/listings/api/listingsApi";

export interface BulkRow {
  id: string;
  item: string;
  category: string;
  weight: string;
  /** Null = N/A, skipped automatically. */
  price: number | null;
}

/**
 * Seller bulk price edit (`isBulk` in Seller App.html): select priced rows,
 * apply −50/+50 or a custom delta via `PATCH /listings/bulk-price`.
 */
export function useBulkEdit() {
  const { session } = useAuth();
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [bulkAmount, setBulkAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      const fetched = await listingsApi.list(token);
      setRows(
        fetched.map((l) => ({
          id: String(l.id),
          item: l.item,
          category: l.category,
          weight: l.weight,
          price: l.price > 0 ? l.price : null,
        })),
      );
      setSelected([]);
    } catch (e) {
      setError(getFriendlyApiError(e, "Could not load listings"));
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

  const selectable = useMemo(
    () => rows.filter((r) => r.price !== null),
    [rows],
  );

  function toggleSelect(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row || row.price === null) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  function selectAll() {
    setSelected(selectable.map((r) => r.id));
  }

  function clear() {
    setSelected([]);
  }

  async function applyDelta(delta: number) {
    const token = session?.token;
    if (!token || selected.length === 0) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      // Backend `delta` mode applies the +/- server-side atomically —
      // send ids + delta, not client-computed absolute prices.
      const ids = rows
        .filter((r) => selected.includes(r.id) && r.price !== null)
        .map((r) => r.id);
      if (ids.length > 0) {
        await listingsApi.bulkPriceDelta(ids, delta, token);
        await load();
      }
    } catch (e) {
      setSaveError(getFriendlyApiError(e, "Could not update prices"));
    } finally {
      setIsSaving(false);
    }
  }

  async function applyTypedAmount() {
    const delta = Number(bulkAmount);
    if (!bulkAmount.trim() || !Number.isFinite(delta) || delta === 0) {
      setSaveError("Enter a non-zero amount, e.g. -25.");
      return;
    }
    setBulkAmount("");
    await applyDelta(Math.trunc(delta));
  }

  return {
    rows,
    selected,
    selectedCount: selected.length,
    bulkAmount,
    setBulkAmount,
    toggleSelect,
    selectAll,
    clear,
    applyDelta,
    applyTypedAmount,
    isLoading,
    isSaving,
    error,
    saveError,
    retry: load,
  };
}
