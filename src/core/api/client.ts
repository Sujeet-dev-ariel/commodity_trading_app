export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Pull a human-readable message out of a non-OK response body. */
function extractErrorMessage(raw: string, status: number): string {
  if (!raw) return `Request failed (${status})`;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "string") return parsed || `Request failed (${status})`;
    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      for (const key of ["message", "error", "detail", "msg"]) {
        const v = obj[key];
        if (typeof v === "string" && v.trim()) return v;
        // Server shape: { success: false, error: { code, message } }
        if (v !== null && typeof v === "object") {
          const nested = (v as Record<string, unknown>)["message"];
          if (typeof nested === "string" && nested.trim()) return nested;
        }
      }
      const errors = obj["errors"];
      if (Array.isArray(errors) && typeof errors[0] === "string") return errors[0];
      if (Array.isArray(errors) && errors[0] && typeof errors[0] === "object") {
        const first = (errors[0] as Record<string, unknown>)["message"];
        if (typeof first === "string" && first.trim()) return first;
      }
    }
  } catch {
    // Not JSON — fall through. Strip HTML tags so server error pages stay readable.
    const text = raw.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (text) return text.slice(0, 200);
  }
  return `Request failed (${status})`;
}

/** Map any thrown API failure to a UI-ready message. */
export function getFriendlyApiError(e: unknown, fallback = "Something went wrong"): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof DOMException && e.name === "AbortError") {
    return "Request timed out. Check your connection and try again.";
  }
  if (e instanceof TypeError) {
    return "Could not reach the server. Is the backend running and CORS enabled for this origin?";
  }
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

/** Minimal JSON fetch wrapper. Callers pass a full URL built with `apiUrl()`. */
export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 15000);
  const method = options.method ?? "GET";
  if (__DEV__) {
    console.log(`[api] ${method} ${url}`, options.body !== undefined ? options.body : "");
  }
  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        // Bypass ngrok's browser-warning interstitial on *.ngrok-free.dev,
        // which otherwise swallows browser GETs (no CORS headers -> net::ERR_FAILED).
        // Harmless against non-ngrok hosts.
        "ngrok-skip-browser-warning": "true",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.headers ?? {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      const message = extractErrorMessage(raw, res.status);
      if (__DEV__) {
        console.log(`[api] ${res.status} ${method} ${url}`, raw);
      }
      throw new ApiError(res.status, message);
    }
    const data = (await res.json()) as T;
    if (__DEV__) {
      console.log(`[api] OK ${method} ${url}`, data);
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}
