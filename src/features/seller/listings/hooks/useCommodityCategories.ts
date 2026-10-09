import { useAuth } from "@/features/auth/hooks/useAuth";
import { catalogApi, type CatalogCategory } from "@/features/shared/catalog/api/catalogApi";
import { useEffect, useState } from "react";

/**
 * Live categories from GET `/commodity-categories` (`{ id, name }` rows).
 * Fails silent (empty list) — callers show an error/empty state.
 */
export function useCommodityCategories() {
  const { runWithAuth } = useAuth();
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) setIsLoading(true);
      try {
        const list = await runWithAuth((token) =>
          catalogApi.getCommodityCategories(token),
        );
        if (!cancelled) setCategories(list);
      } catch {
        // Callers render the empty/error state.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [runWithAuth]);

  return { categories, isLoading };
}
