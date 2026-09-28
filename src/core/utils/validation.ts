/**
 * Indian mobile-number helpers.
 * Canonical phone format across the app is E.164: `+91XXXXXXXXXX`.
 */

/** Returns the normalized `+91…` number, or null when invalid. */
export function normalizeIndianPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const local =
    digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return `+91${local}`;
}

/** Human-friendly display: `+91 99100 22334`. */
export function formatPhoneDisplay(e164: string): string {
  const local = e164.replace(/\D/g, "").slice(-10);
  return local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : e164;
}

/** Input mask for the phone field: `9876543210` → `98765 43210`. */
export function formatLocalPhoneInput(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  return d.length > 5 ? `${d.slice(0, 5)} ${d.slice(5)}` : d;
}
