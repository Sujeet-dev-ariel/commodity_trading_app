const raw = (process.env.EXPO_PUBLIC_API_URL ?? "").trim();

export const ENV = {
  /** Base URL for the backend API. */
  apiUrl: raw || "https://api.example.com",
} as const;
