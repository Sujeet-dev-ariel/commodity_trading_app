import { ApiError, apiFetch } from "@/core/api/client";
import { LISTINGS_ENDPOINTS, apiUrl } from "@/core/api/endpoints";
import type { Category, Listing } from "@/types/domain";

/**
 * Real backend: `router.use(authenticate)` — every call needs the session token.
 * Field names mirror `validateSellListingInput` in the backend
 * (`listing.validation.js`): categoryId/commodityId UUIDs, quantityBags
 * required, weightKg/price optional, quality one of the backend grades.
 */
export interface CreateListingInput {
  categoryId: string;
  commodityId: string;
  quality?: string | null;
  quantityBags: number;
  weightKg?: number | null;
  /** Price per bag in rupees; null = shell listing without price. */
  price?: number | null;
  moisture?: string | null;
  color?: string | null;
  size?: string | null;
  /** Per-listing override; null = the firm default applies. */
  paymentTerms?: string | null;
  notes?: string | null;
}

/** Minimal created-listing shape (tolerates `{ success, data }` or flat). */
export interface CreatedListing {
  id: string;
  item: string;
  price: number | null;
}

export interface BulkPriceUpdate {
  id: string;
  price: number;
}

function toPayload(input: CreateListingInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    side: "SELL",
    categoryId: input.categoryId,
    commodityId: input.commodityId,
    quantityBags: input.quantityBags,
  };
  if (input.quality) body["quality"] = input.quality;
  if (input.weightKg != null) body["weightKg"] = input.weightKg;
  if (input.price != null) body["price"] = input.price;
  if (input.moisture) body["moisture"] = input.moisture;
  if (input.color) body["color"] = input.color;
  if (input.size) body["size"] = input.size;
  if (input.paymentTerms) body["paymentTerms"] = input.paymentTerms;
  if (input.notes) body["notes"] = input.notes;
  return body;
}

function toStringId(v: unknown): string | null {
  if (typeof v === "string" && v.trim()) return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function pickString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v;
    if (v !== null && typeof v === "object") {
      const nested = (v as Record<string, unknown>)["name"];
      if (typeof nested === "string" && nested.trim()) return nested;
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

/** Backend sends `{ success: true, data: ... }`; accept bare payloads too. */
function unwrapOne(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object") {
    const root = raw as Record<string, unknown>;
    const inner = root["data"];
    if (inner !== null && typeof inner === "object")
      return inner as Record<string, unknown>;
    return root;
  }
  return {};
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

/** Coerce one backend listing into the app `Listing` domain shape. */
function normalizeListing(obj: Record<string, unknown>): Listing | null {
  const id =
    toStringId(obj["id"]) ??
    toStringId(obj["_id"]) ??
    toStringId(obj["listingId"]);
  // Backend derives `itemName` from the commodity; `weightKg` is an int.
  const item = pickString(obj, "itemName", "item", "name", "title", "commodity");
  if (!id || !item) return null;
  const weightKg = pickNumber(obj, "weightKg", "weight_kg");
  const weight =
    pickString(obj, "weight", "weightPerBag", "bagWeight") ||
    (weightKg != null ? `${weightKg}KG` : "");
  const seller =
    pickString(
      obj,
      "seller",
      "sellerName",
      "vendor",
      "firm",
      "firmName",
      "company",
    ) || "Unknown seller";
  return {
    id: Number.isNaN(Number(id)) ? id : Number(id),
    category: (pickString(obj, "category") || "Rice") as Category,
    item,
    quality: pickString(obj, "quality", "grade", "variant"),
    weight,
    seller,
    price: pickNumber(obj, "price", "pricePerBag", "rate") ?? 0,
  } as Listing;
}

function normalizeCreated(raw: unknown): CreatedListing {
  const data = unwrapOne(raw);
  const id =
    toStringId(data["id"]) ??
    toStringId(data["_id"]) ??
    toStringId(data["listingId"]);
  // Backend derives `itemName` from the commodity — it is never a client input.
  const item = pickString(data, "itemName", "item", "name", "title");
  const price = pickNumber(data, "price", "pricePerBag", "rate");
  if (!id || !item) {
    throw new ApiError(500, "Unexpected server response to listing publish.");
  }
  return { id, item, price };
}

export const listingsApi = {
  /** GET `/listings?side=SELL` — live market listings for buyer browse. */
  async list(token: string): Promise<Listing[]> {
    const raw = await apiFetch<unknown>(
      apiUrl(LISTINGS_ENDPOINTS.list("SELL")),
      { token },
    );
    const out: Listing[] = [];
    for (const obj of unwrapList(raw)) {
      const l = normalizeListing(obj);
      if (l) out.push(l);
    }
    return out;
  },

  /** GET `/listings/:id` — single listing detail. */
  async getById(id: string, token: string): Promise<Listing> {
    const raw = await apiFetch<unknown>(apiUrl(LISTINGS_ENDPOINTS.byId(id)), {
      token,
    });
    const listing = normalizeListing(unwrapOne(raw));
    if (!listing)
      throw new ApiError(500, "Unexpected server response to listing detail.");
    return listing;
  },

  /** POST `/listings` — publish a seller listing. */
  async create(
    input: CreateListingInput,
    token: string,
  ): Promise<CreatedListing> {
    const raw = await apiFetch<unknown>(apiUrl(LISTINGS_ENDPOINTS.create), {
      method: "POST",
      token,
      body: toPayload(input),
    });
    return normalizeCreated(raw);
  },

  /** PATCH `/listings/:id` — edit price/fields of own listing. */
  async update(
    id: string,
    patch: Partial<CreateListingInput>,
    token: string,
  ): Promise<Listing> {
    const raw = await apiFetch<unknown>(apiUrl(LISTINGS_ENDPOINTS.byId(id)), {
      method: "PATCH",
      token,
      body: patch,
    });
    const listing = normalizeListing(unwrapOne(raw));
    if (!listing)
      throw new ApiError(500, "Unexpected server response to listing update.");
    return listing;
  },

  /** PATCH `/listings/:id/withdraw` — take own listing off the market. */
  async withdraw(id: string, token: string): Promise<void> {
    await apiFetch<unknown>(apiUrl(LISTINGS_ENDPOINTS.withdraw(id)), {
      method: "PATCH",
      token,
    });
  },

  /**
   * PATCH `/listings/bulk-price` — bulk edit prices.
   * NOTE: body shape is `{ updates: [{ id, price }] }`; align here if the
   * backend contract differs.
   */
  async bulkPrice(updates: BulkPriceUpdate[], token: string): Promise<void> {
    await apiFetch<unknown>(apiUrl(LISTINGS_ENDPOINTS.bulkPrice), {
      method: "PATCH",
      token,
      body: { updates },
    });
  },
};
