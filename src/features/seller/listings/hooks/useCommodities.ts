import { useAuth } from "@/features/auth/hooks/useAuth";
import { catalogApi, type CatalogCommodity } from "@/features/shared/catalog/api/catalogApi";
import { useEffect, useState } from "react";

/**
 * Live commodities for one category from GET `/commodities?categoryId=`.
 * Pass `null` (no category chosen yet) to get an empty list.
 */
export function useCommodities(categoryId: string | null) {
  const { runWithAuth } = useAuth();
  const [commodities, setCommodities] = useState<CatalogCommodity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!categoryId) {
        if (!cancelled) {
          setCommodities([]);
          setIsLoading(false);
        }
        return;
      }
      if (!cancelled) setIsLoading(true);
      try {
        const list = await runWithAuth((token) =>
          catalogApi.getCommodities(token, categoryId),
        );
        if (!cancelled) setCommodities(list);
      } catch {
        if (!cancelled) setCommodities([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [runWithAuth, categoryId]);

  return { commodities, isLoading };
}
