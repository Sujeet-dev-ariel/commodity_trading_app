import { Stack } from "expo-router";

/**
 * Requirements tab stack: list (`index`) + Negotiate (`[id]`).
 * Nested in the tab so the seller bottom bar stays visible on both —
 * pushing Negotiate keeps the Browse tab highlighted underneath.
 */
export default function RequirementsStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
