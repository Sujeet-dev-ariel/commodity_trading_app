import { Stack } from "expo-router";

/**
 * Browse tab stack: list (`index`) + listing detail (`[id]`).
 * Nested in the tab so the buyer bottom bar stays visible on both.
 */
export default function BrowseStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
