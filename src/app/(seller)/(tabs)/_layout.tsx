import { Tabs } from "expo-router";
import { AppTabBar, SELLER_BAR } from "@/components/common/AppTabBar";

interface TabBarProps {
  state: { index: number; routes: { name: string }[] };
  navigation: { navigate: (name: string) => void };
}

function SellerBar({ state, navigation }: TabBarProps) {
  const active = state.routes[state.index]?.name ?? null;
  return (
    <AppTabBar
      items={SELLER_BAR}
      active={active}
      onPress={(target) => navigation.navigate(target)}
    />
  );
}

/** Seller tabs (requirements/Browse keeps the bar visible, per prototype). */
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
      <Tabs.Screen name="transport" options={{ title: "Freight" }} />
    </Tabs>
  );
}
