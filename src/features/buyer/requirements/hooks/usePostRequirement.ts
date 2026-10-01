import { getFriendlyApiError } from "@/core/api/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { requirementsApi } from "@/features/buyer/requirements/api/requirementsApi";
import { postRequirementSchema } from "@/features/seller/listings/schemas/listingSchemas";
import { catalogApi, type CatalogCategory, type CatalogCommodity } from "@/features/shared/catalog/api/catalogApi";
import { useCallback, useEffect, useMemo, useState } from "react";

export type PostRequirementField = "categoryId" | "commodityId" | "quantity" | "price";

export interface PostRequirementValues {
  categoryId: string;
  commodityId: string;
  quantity: string;
  price: string;
}

export type PostRequirementFieldErrors = Partial<Record<PostRequirementField, string>>;

const INITIAL_VALUES: PostRequirementValues = {
  categoryId: "",
  commodityId: "",
  quantity: "",
  price: "",
};

/**
 * Buyer post-requirement form: category → commodity (live UUIDs), quantity
 * (required), target price (optional), then POSTs `side: "BUY"`.
 */
export function usePostRequirement() {
  const { session } = useAuth();
  const [values, setValues] = useState<PostRequirementValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<PostRequirementFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [commodities, setCommodities] = useState<CatalogCommodity[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [commoditiesLoading, setCommoditiesLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = session?.token;
      if (!token) {
        if (!cancelled) setCatalogLoading(false);
        return;
      }
      try {
        const list = await catalogApi.getCommodityCategories(token);
        if (!cancelled) setCategories(list);
      } catch {
        // Screen renders the empty state.
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.token]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = session?.token;
      if (!token || !values.categoryId) {
        if (!cancelled) {
          setCommodities([]);
          setCommoditiesLoading(false);
        }
        return;
      }
      if (!cancelled) setCommoditiesLoading(true);
      try {
        const list = await catalogApi.getCommodities(token, values.categoryId);
        if (!cancelled) setCommodities(list);
      } catch {
        if (!cancelled) setCommodities([]);
      } finally {
        if (!cancelled) setCommoditiesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.token, values.categoryId]);

  const categoryNameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name] as const)),
    [categories],
  );
  const commodityNameById = useMemo(
    () => new Map(commodities.map((c) => [c.id, c.name] as const)),
    [commodities],
  );

  const setField = useCallback((field: PostRequirementField, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "categoryId" && value !== prev.categoryId) {
        next.commodityId = "";
      }
      return next;
    });
    setFieldErrors((prev) => {
      if (!prev[field] && !(field === "categoryId" && prev["commodityId"])) return prev;
      const next = { ...prev };
      delete next[field];
      if (field === "categoryId") delete next["commodityId"];
      return next;
    });
  }, []);

  async function submit(): Promise<boolean> {
    setError(null);
    setSuccess(null);
    const parsed = postRequirementSchema.safeParse({
      categoryId: values.categoryId,
      commodityId: values.commodityId,
      quantity: values.quantity,
      price: values.price,
    });
    if (!parsed.success) {
      const nextErrors: PostRequirementFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as PostRequirementField | undefined;
        if (key && !nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return false;
    }
    const token = session?.token;
    if (!token) {
      setError("Your session expired. Please sign in again.");
      return false;
    }
    setIsLoading(true);
    try {
      const created = await requirementsApi.create(
        {
          categoryId: values.categoryId.trim(),
          commodityId: values.commodityId.trim(),
          quantityBags: Number(values.quantity.trim()),
          price: values.price.trim() ? Number(values.price.trim()) : null,
        },
        token,
      );
      setFieldErrors({});
      setValues(INITIAL_VALUES);
      setSuccess(
        created.targetPrice > 0
          ? `Requirement posted: ${created.item} — ${created.bags} bags at Rs.${created.targetPrice.toLocaleString("en-IN")}.`
          : `Requirement posted: ${created.item} — ${created.bags} bags (open to offers).`,
      );
      return true;
    } catch (e) {
      setError(getFriendlyApiError(e, "Could not post the requirement"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    values,
    setField,
    fieldErrors,
    error,
    success,
    isLoading,
    submit,
    categories,
    commodities,
    catalogLoading,
    commoditiesLoading,
    categoryNameById,
    commodityNameById,
  };
}
