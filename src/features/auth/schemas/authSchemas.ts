import { z } from "zod";
import { normalizeIndianPhone } from "@/core/utils/validation";

/** Validates a 10-digit Indian mobile number, outputs E.164 `+91…`. */
export const phoneSchema = z
  .string()
  .trim()
  .refine((v) => normalizeIndianPhone(v) !== null, {
    message: "Enter a valid 10-digit mobile number",
  })
  .transform((v) => normalizeIndianPhone(v) as string);

/** 4-digit OTP, matching the prototypes. */
export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, "Enter the 4-digit code");
