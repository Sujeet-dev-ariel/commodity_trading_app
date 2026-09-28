export const ENV = {
  /** Base URL for the backend API. */
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com",
} as const;
