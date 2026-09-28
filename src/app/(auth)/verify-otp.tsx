import { Redirect, useLocalSearchParams } from "expo-router";
import { VerifyOtpScreen } from "@/features/auth/screens/VerifyOtpScreen";

export default function VerifyOtpRoute() {
  const { phone, expiresInSec } = useLocalSearchParams<{
    phone?: string;
    expiresInSec?: string;
  }>();

  if (!phone) return <Redirect href="/login" />;

  return (
    <VerifyOtpScreen
      phone={phone}
      expiresInSec={expiresInSec ? Number(expiresInSec) : undefined}
    />
  );
}
