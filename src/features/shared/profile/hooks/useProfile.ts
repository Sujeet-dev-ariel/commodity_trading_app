import type { Role } from "@/types/domain";

export interface ProfileRow {
  key: string;
  label: string;
  /** Href of an implemented route, if any. */
  href?: "/terms";
  /** Small tag shown before the chevron (e.g. ToS status). */
  tag?: string;
  /** Non-interactive row (e.g. "Coming soon"). */
  disabled?: boolean;
}

/**
 * Common profile rows (`isProfile` in both prototypes — one screen,
 * parameterized by role; only the role-specific rows differ).
 */
export function useProfile(role: Role | null) {
  const main: ProfileRow[] = [
    { key: "account", label: "Account" },
    { key: "payment", label: "Payment terms" },
    { key: "terms-status", label: "Terms of Service", href: "/terms", tag: "Accepted" },
    { key: "trades", label: "Past trades" },
    ...(role === "seller"
      ? [
          { key: "listings", label: "My listings" },
          { key: "bagweight", label: "Bag weight" },
          { key: "template", label: "Saved supplier parse template", tag: "Coming soon", disabled: true },
        ]
      : [{ key: "requirements", label: "My requirements" }]),
    { key: "preferences", label: "Preferences" },
  ];

  const share: ProfileRow[] = [{ key: "share", label: "Share with your friends" }];

  const legal: ProfileRow[] = [
    { key: "privacy", label: "Privacy policy" },
    { key: "terms", label: "Terms of Service", href: "/terms" },
  ];

  return { main, share, legal };
}
