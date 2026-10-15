import { LegalScreen } from "@/features/shared/profile/screens/LegalScreen";

/** Thin route — Profile → bottom platform Terms of Service (read-only). */
export default function PlatformTermsRoute() {
  return <LegalScreen doc="terms" />;
}
