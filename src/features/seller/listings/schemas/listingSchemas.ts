import { z } from "zod";

/** Offline fallback options (live list comes from GET `/commodity-categories`). */
export const LISTING_CATEGORIES = ["Besan", "Dal", "Matar", "Chana", "Rajma", "Rice"] as const;

/** Mirrors `QUALITY_GRADES` in the backend `listing.validation.js`. */
export const QUALITY_GRADES = ["barik", "chota", "mota", "dardra"] as const;

const uuid = z
  .string()
  .trim()
  .min(1, "Select an option")
  .uuid("Invalid selection — refresh and try again");

const positiveIntString = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`)
    .refine((v) => /^\d+$/.test(v) && Number(v) > 0, {
      message: `${field} must be a positive whole number`,
    });

const optionalPositiveIntString = (field: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) > 0), {
      message: `${field} must be a positive whole number`,
    });

const optionalPositiveDecimalString = (field: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || (Number(v) > 0 && Number.isFinite(Number(v))), {
      message: `${field} must be a number greater than 0`,
    });

const positiveDecimalString = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`)
    .refine((v) => Number(v) > 0 && Number.isFinite(Number(v)), {
      message: `${field} must be a number greater than 0`,
    });

/**
 * Seller Add-listing validation — mirrors backend `validateSellListingInput`:
 * categoryId + commodityId UUIDs, quantityBags and price required,
 * weightKg optional, quality one of the backend grades or empty,
 * photo/video uploads not yet supported so omitted.
 * All fields stay strings here — the hook converts numbers at the boundary.
 */
export const addListingSchema = z.object({
  categoryId: uuid,
  commodityId: uuid,
  quality: z
    .string()
    .trim()
    .refine((v) => v === "" || (QUALITY_GRADES as readonly string[]).includes(v), {
      message: `Quality must be one of: ${QUALITY_GRADES.join(", ")}`,
    }),
  quantity: positiveIntString("Quantity"),
  weightKg: optionalPositiveIntString("Weight"),
  price: positiveDecimalString("Price"),
  moisture: z.string().max(40, "Keep moisture under 40 characters"),
  color: z.string().max(40, "Keep color under 40 characters"),
  size: z.string().max(40, "Keep size under 40 characters"),
  paymentTerms: z.string().max(200, "Keep payment terms under 200 characters"),
  notes: z.string().max(500, "Keep notes under 500 characters"),
});

export type AddListingSchema = z.infer<typeof addListingSchema>;

/**
 * Buyer post-requirement validation — mirrors backend
 * `validateBuyRequirementInput`: categoryId + commodityId UUIDs,
 * quantityBags required, price optional.
 */
export const postRequirementSchema = z.object({
  categoryId: uuid,
  commodityId: uuid,
  quantity: positiveIntString("Quantity"),
  price: optionalPositiveDecimalString("Target price"),
});

export type PostRequirementSchema = z.infer<typeof postRequirementSchema>;
