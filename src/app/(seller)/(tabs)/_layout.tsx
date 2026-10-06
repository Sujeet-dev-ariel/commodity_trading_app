import { Tabs } from "expo-router";
import { AppTabBar, SELLER_BAR } from "@/components/common/AppTabBar";

interface TabBarProps {
  state: { index: number; routes: { name: string }[] };
  navigation: { navigate: (name: string) => void };
}

function SellerBar({ state, navigation }: TabBarProps) {
  const route = state.routes[state.index]?.name ?? null;
  // The listing form is a sub-screen of the Add listing tab (prototype:
  // dashboard `goAdd` → form), so keep the tab highlighted while on it.
  const active = route === "add-listing-form" ? "add-listing" : route;
  return (
    <AppTabBar
      items={SELLER_BAR}
      active={active}
      onPress={(target) => navigation.navigate(target)}
    />
  );
}

/**
 * Seller tabs. Browse (buyer requirements) is first + default.
 * The Add listing tab serves the Today's-listings dashboard
 * (prototype `backHome`); the form is a sub-screen of that tab with no
 * tab button of its own.
 */
export default function SellerTabsLayout() {
  return (
    <Tabs
      initialRouteName="requirements"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <SellerBar {...props} />}
    >
      <Tabs.Screen name="requirements" options={{ title: "Browse" }} />
      <Tabs.Screen name="orders" options={{ title: "Trades" }} />
      <Tabs.Screen name="add-listing" options={{ title: "Add listing" }} />
      <Tabs.Screen name="add-listing-form" options={{ title: "Add listing" }} />
      <Tabs.Screen name="transport" options={{ title: "Freight" }} />
    </Tabs>
  );
}
