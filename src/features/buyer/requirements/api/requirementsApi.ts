import { ApiError, apiFetch } from "@/core/api/client";
import { LISTINGS_ENDPOINTS, apiUrl } from "@/core/api/endpoints";
import type { BuyerRequirement, Category } from "@/types/domain";

/** Seller browse source (Seller App.html `isRequirements`). */

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (v !== null && typeof v === "object") {
      const nested = v as Record<string, unknown>;
      for (const key of [
        "firmName",
        "firm",
        "company",
        "companyName",
        "shopName",
        "name",
        "fullName",
        "displayName",
        "username",
        "title",
        "label",
        "item",
      ]) {
        const value = nested[key];
        if (typeof value === "string" && value.trim()) return value.trim();
      }
    }
  }
  return "";
}

function pickNumber(
  obj: Record<string, unknown>,
  ...keys: string[]
): number | null {
  for (const k of keys) {
    const v = obj[k];
    const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
    if (typeof n === "number" && Number.isFinite(n)) return n;
  }
  return null;
}

function unwrapList(raw: unknown): Record<string, unknown>[] {
  const pick = (
    obj: Record<string, unknown>,
  ): Record<string, unknown>[] | null => {
    for (const k of ["items", "results", "listings", "rows"]) {
      const v = obj[k];
      if (Array.isArray(v)) return v as Record<string, unknown>[];
    }
    return null;
  };
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  if (raw && typeof raw === "object") {
    const root = raw as Record<string, unknown>;
    const inner = root["data"];
    if (Array.isArray(inner)) return inner as Record<string, unknown>[];
    if (inner !== null && typeof inner === "object") {
      const fromInner = pick(inner as Record<string, unknown>);
      if (fromInner) return fromInner;
    }
    const fromRoot = pick(root);
    if (fromRoot) return fromRoot;
  }
  return [];
}

function unwrapOne(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object") {
    const root = raw as Record<string, unknown>;
    const inner = root["data"];
    if (inner !== null && typeof inner === "object") {
      const nested = inner as Record<string, unknown>;
      // Accept `{ data: { listing } }` as well as `{ data: {...fields} }`.
      for (const k of ["listing", "requirement", "item"]) {
        const v = nested[k];
        if (v !== null && typeof v === "object")
          return v as Record<string, unknown>;
      }
      return nested;
    }
    for (const k of ["listing", "requirement", "item"]) {
      const v = root[k];
      if (v !== null && typeof v === "object")
        return v as Record<string, unknown>;
    }
    return root;
  }
  return {};
}

function toId(v: unknown): string | number | null {
  if (typeof v === "string" && v.trim()) return v;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

/** Coerce one BUY-side listing into the Seller requirements row shape. */
function normalizeRequirement(
  obj: Record<string, unknown>,
): BuyerRequirement | null {
  const id =
    toId(obj["id"]) ??
    toId(obj["_id"]) ??
    toId(obj["requirementId"]) ??
    toId(obj["reqId"]) ??
    toId(obj["listingId"]) ??
    toId(obj["requirement_id"]) ??
    toId(obj["listing_id"]) ??
    toId(obj["uuid"]);
  // Backend derives `itemName` from the commodity — prefer it first.
  const item = pickString(
    obj,
    "itemName",
    "item_name",
    "item",
    "commodity",
    "commodityName",
    "commodity_name",
    "productName",
    "product_name",
    "name",
    "title",
    "product",
  );
  if (id == null || !item) return null;
  return {
    // Keep the backend id verbatim (UUID string or number). Coercing with
    // `Number(id)` collapses every UUID to 0 → duplicate React keys and
    // every row opening the same detail.
    id,
    category: (pickString(
      obj,
      "category",
      "categoryName",
      "category_name",
      "commodity",
    ) || "Rice") as Category,
    item,
    buyer:
      pickString(
        obj,
        "buyer",
        "buyerName",
        "postedBy",
        "buyerFirm",
        "buyerCompany",
        "buyer_company",
        "customer",
        "firmName",
        "firm",
        "company",
        "companyName",
        "company_name",
        "shopName",
        "createdBy",
        "created_by",
        "user",
        "owner",
        "userName",
        "user_name",
      ) || "Unknown buyer",
    paymentTerms: pickString(
      obj,
      "paymentTerms",
      "paymentTerm",
      "payment",
      "terms",
      "payTerms",
      "paymentTermsText",
      "payment_terms",
    ),
    targetPrice:
      pickNumber(
        obj,
        "targetPrice",
        "targetPricePerBag",
        "target_price",
        "expectedPrice",
        "expectedPricePerBag",
        "expected_price",
        "bidPrice",
        "offerPrice",
        "pricePerBag",
        "price_per_bag",
        "price",
      ) ?? 0,
    bags:
      pickNumber(
        obj,
        "bags",
        "quantity",
        "quantityBags",
        "quantityInBags",
        "quantity_in_bags",
        "bagCount",
        "bag_count",
        "numberOfBags",
        "noOfBags",
        "qtyBags",
        "qty",
      ) ?? 0,
  };
}

/** Buyer post-requirement input — mirrors backend `validateBuyRequirementInput`. */
export interface CreateRequirementInput {
  categoryId: string;
  commodityId: string;
  quantityBags: number;
  /** Target price per bag; null = open to offers. */
  price?: number | null;
}

export const requirementsApi = {
  /**
   * POST `/listings` with `side: "BUY"` — post a buyer requirement.
   * `itemName` is derived server-side from the commodity.
   */
  async create(
    input: CreateRequirementInput,
    token: string,
  ): Promise<BuyerRequirement> {
    const body: Record<string, unknown> = {
      side: "BUY",
      categoryId: input.categoryId,
      commodityId: input.commodityId,
      quantityBags: input.quantityBags,
    };
    if (input.price != null) body["price"] = input.price;
    const raw = await apiFetch<unknown>(apiUrl(LISTINGS_ENDPOINTS.create), {
      method: "POST",
      token,
      body,
    });
    const requirement = normalizeRequirement(unwrapOne(raw));
    if (!requirement) {
      throw new ApiError(
        502,
        "The server returned this requirement in an unsupported format.",
      );
    }
    return requirement;
  },

  /** GET `/listings?side=BUY`; the backend already filters to buyer entries. */
  async list(token: string): Promise<BuyerRequirement[]> {
    const raw = await apiFetch<unknown>(
      apiUrl(LISTINGS_ENDPOINTS.list("BUY")),
      { token },
    );
    const records = unwrapList(raw);
    const requirements = records
      .map(normalizeRequirement)
      .filter(
        (requirement): requirement is BuyerRequirement => requirement !== null,
      );

    if (__DEV__ && requirements.length !== records.length) {
      const unmapped = records.filter(
        (record) => normalizeRequirement(record) === null,
      );
      console.warn("[requirements] Some BUY listings could not be mapped", {
        received: records.length,
        mapped: requirements.length,
        unmappedFields: unmapped.map((record) => Object.keys(record)),
      });
    }
    if (records.length > 0 && requirements.length === 0) {
      throw new ApiError(
        502,
        "The server returned buyer requirements in an unsupported format.",
      );
    }
    return requirements;
  },

  /**
   * GET `/listings/:id` — single buyer-requirement detail
   * (backend: `router.get('/:id', listingController.getById)`).
   */
  async getById(id: string, token: string): Promise<BuyerRequirement> {
    const raw = await apiFetch<unknown>(apiUrl(LISTINGS_ENDPOINTS.byId(id)), {
      token,
    });
    const requirement = normalizeRequirement(unwrapOne(raw));
    if (!requirement) {
      throw new ApiError(
        502,
        "The server returned this requirement in an unsupported format.",
      );
    }
    return requirement;
  },
};
