import { Stack } from "expo-router";

/**
 * Post req tab stack: My requirements list (`index`) + post form (`new`) +
 * requirement detail (`[id]`). Nested in the tab so the buyer bottom bar
 * stays visible on all three — mirrors the seller add-listing flow.
 */
export default function PostReqStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
