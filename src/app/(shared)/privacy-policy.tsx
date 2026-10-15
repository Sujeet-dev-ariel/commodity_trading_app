import { LegalScreen } from "@/features/shared/profile/screens/LegalScreen";

/** Thin route — Profile → bottom platform Privacy Policy (read-only). */
export default function PrivacyPolicyRoute() {
  return <LegalScreen doc="privacy" />;
}
