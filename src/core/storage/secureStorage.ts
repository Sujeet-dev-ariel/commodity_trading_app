import * as SecureStore from "expo-secure-store";

/**
 * Secure key-value storage. Falls back to memory when SecureStore is
 * unavailable (e.g. web), so auth flows still work everywhere.
 */
const memoryFallback = new Map<string, string>();

async function setItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    memoryFallback.set(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ?? memoryFallback.get(key) ?? null;
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

async function deleteItem(key: string): Promise<void> {
  memoryFallback.delete(key);
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Already cleared from the fallback above.
  }
}

export const secureStorage = { setItem, getItem, deleteItem };
