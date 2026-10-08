import { ApiError, apiDownload, apiFetch, apiUpload } from "@/core/api/client";
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
  listingId: string;
  price: number;
}

/** Backend `parseUploadedWorkbook` preview row (POST /listings/bulk-upload). */
export interface BulkPreviewSuggestion {
  id: string;
  name: string;
  similarity: number;
}

export interface BulkPreviewRow {
  rowIndex: number;
  raw: Record<string, unknown>;
  resolved: {
    categoryId: string | null;
    categoryMatch: "exact" | "fuzzy" | "unresolved";
    categorySuggestion: BulkPreviewSuggestion | null;
    commodityId: string | null;
    commodityMatch: "exact" | "fuzzy" | "unresolved";
    commoditySuggestion: BulkPreviewSuggestion | null;
    itemName: string | null;
    quality: string | null;
    quantityBags: number | null;
    weightKg: number | null;
    price: number | null;
    paymentTerms: number | null;
    notes: string | null;
    moisture: string | null;
    color: string | null;
    size: string | null;
  };
  willUpdateExisting: string | null;
  errors: string[];
  ready: boolean;
}

export interface BulkPreviewResult {
  summary: { totalRows: number; readyRows: number; needsReviewRows: number };
  rows: BulkPreviewRow[];
}

/** One row for POST /listings/bulk-confirm — resolved IDs + validated cells. */
export interface BulkConfirmRow {
  rowIndex?: number;
  categoryId: string;
  commodityId: string;
  quality?: string | null;
  quantityBags: number;
  weightKg?: number | null;
  price?: number | null;
  paymentTerms?: number | null;
  notes?: string | null;
  moisture?: string | null;
  color?: string | null;
  size?: string | null;
}

export interface BulkConfirmResult {
  created: { rowIndex?: number; listingId: string }[];
  updated: { rowIndex?: number; listingId: string }[];
  failed: { rowIndex?: number; reason: string }[];
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
   * PATCH `/listings/bulk-price` — delta mode. Applies the same +/- `value`
   * to `listingIds` atomically server-side (backend `bulkDeltaPrice`).
   * This is what the Bulk edit screen uses — no stale-price race.
   */
  async bulkPriceDelta(
    listingIds: string[],
    value: number,
    token: string,
  ): Promise<void> {
    await apiFetch<unknown>(apiUrl(LISTINGS_ENDPOINTS.bulkPrice), {
      method: "PATCH",
      token,
      body: { mode: "delta", listingIds, value },
    });
  },

  /**
   * PATCH `/listings/bulk-price` — set-many mode. Distinct absolute price
   * per listing (backend `bulkSetManyPrice`, entries keyed by `listingId`).
   */
  async bulkPriceSetMany(
    updates: BulkPriceUpdate[],
    token: string,
  ): Promise<void> {
    await apiFetch<unknown>(apiUrl(LISTINGS_ENDPOINTS.bulkPrice), {
      method: "PATCH",
      token,
      body: { mode: "set-many", updates },
    });
  },

  /**
   * PATCH `/listings/bulk-price` — legacy absolute-price helper.
   * Prefer `bulkPriceDelta` / `bulkPriceSetMany` which match the backend
   * `{ mode }` dispatcher.
   * @deprecated Use bulkPriceSetMany instead.
   */
  async bulkPrice(updates: BulkPriceUpdate[], token: string): Promise<void> {
    return listingsApi.bulkPriceSetMany(updates, token);
  },

  /** GET `/listings/template` — .xlsx with Category/Commodity dropdowns. */
  async downloadTemplate(token: string): Promise<Blob> {
    return apiDownload(apiUrl(LISTINGS_ENDPOINTS.template), { token });
  },

  /**
   * POST `/listings/bulk-upload` — multipart `file` (.xlsx, 5MB max).
   * Returns a row-by-row preview: `ready` rows can go straight to
   * `bulkConfirm`; the rest carry `errors` + fuzzy `suggestion`s.
   * Accepts a web Blob or a native `{ uri, name, mimeType }` file ref —
   * the latter is required on iOS/Android where Blob-from-uri is unreliable.
   */
  async bulkUpload(
    file: Blob | { uri: string; name: string; mimeType?: string },
    fileName: string,
    token: string,
  ): Promise<BulkPreviewResult> {
    const form = new FormData();
    if (typeof Blob !== "undefined" && file instanceof Blob) {
      form.append("file", file, fileName);
    } else {
      const ref = file as { uri: string; name: string; mimeType?: string };
      form.append("file", {
        uri: ref.uri,
        name: ref.name || fileName,
        type:
          ref.mimeType ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      } as unknown as Blob);
    }
    const raw = await apiUpload<unknown>(apiUrl(LISTINGS_ENDPOINTS.bulkUpload), form, {
      token,
      timeoutMs: 60000,
    });
    const data = unwrapOne(raw);
    const summaryRaw = (data["summary"] ?? data) as Record<string, unknown>;
    const rowsRaw = (data["rows"] ?? []) as unknown[];
    const num = (v: unknown): number =>
      typeof v === "number" && Number.isFinite(v) ? v : 0;
    return {
      summary: {
        totalRows: num(summaryRaw["totalRows"] ?? rowsRaw.length),
        readyRows: num(summaryRaw["readyRows"]),
        needsReviewRows: num(
          summaryRaw["needsReviewRows"] ??
            (Array.isArray(rowsRaw) ? rowsRaw.length - num(summaryRaw["readyRows"]) : 0),
        ),
      },
      rows: (Array.isArray(rowsRaw) ? rowsRaw : []) as BulkPreviewRow[],
    };
  },

  /**
   * POST `/listings/bulk-confirm` — publish the reviewed rows. Creates new
   * listings or updates the seller's live duplicate (same
   * category/commodity/weight/quality). Partial success: check `failed`.
   */
  async bulkConfirm(rows: BulkConfirmRow[], token: string): Promise<BulkConfirmResult> {
    const raw = await apiFetch<unknown>(apiUrl(LISTINGS_ENDPOINTS.bulkConfirm), {
      method: "POST",
      token,
      body: { rows },
    });
    const data = unwrapOne(raw);
    const asList = (v: unknown): Record<string, unknown>[] =>
      Array.isArray(v) ? (v as Record<string, unknown>[]) : [];
    return {
      created: asList(data["created"]).map((r) => ({
        rowIndex: typeof r["rowIndex"] === "number" ? (r["rowIndex"] as number) : undefined,
        listingId: String(r["listingId"] ?? ""),
      })),
      updated: asList(data["updated"]).map((r) => ({
        rowIndex: typeof r["rowIndex"] === "number" ? (r["rowIndex"] as number) : undefined,
        listingId: String(r["listingId"] ?? ""),
      })),
      failed: asList(data["failed"]).map((r) => ({
        rowIndex: typeof r["rowIndex"] === "number" ? (r["rowIndex"] as number) : undefined,
        reason: typeof r["reason"] === "string" ? (r["reason"] as string) : "Unknown error",
      })),
    };
  },
};
