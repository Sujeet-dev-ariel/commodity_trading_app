import { useAuth } from "@/features/auth/hooks/useAuth";
import { catalogApi, type CatalogCategory } from "@/features/shared/catalog/api/catalogApi";
import { useEffect, useState } from "react";

/**
 * Live categories from GET `/commodity-categories` (`{ id, name }` rows).
 * Fails silent (empty list) — callers show an error/empty state.
 */
export function useCommodityCategories() {
  const { session } = useAuth();
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = session?.token;
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }
      if (!cancelled) setIsLoading(true);
      try {
        const list = await catalogApi.getCommodityCategories(token);
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
  }, [session?.token]);

  return { categories, isLoading };
}
