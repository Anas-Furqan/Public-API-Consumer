export type ApiErrorCode = "CITY_NOT_FOUND" | "API_TIMEOUT" | "INVALID_INPUT";

export type ApiErrorPayload = {
  error: true;
  code: ApiErrorCode;
  message: string;
};

export type ApiSuccessPayload<T> = {
  data: T;
  warnings: string[];
};

export function sanitizeTextInput(value: string) {
  return value.replace(/[^a-zA-Z\s-]/g, "").trim();
}

export function validateTextInput(value: string) {
  const cleaned = sanitizeTextInput(value);
  if (cleaned.length < 2 || cleaned.length > 50) {
    return {
      ok: false,
      value: cleaned,
      error: {
        error: true,
        code: "INVALID_INPUT" as const,
        message: "Please provide a valid city or country name.",
      },
    };
  }

  return { ok: true, value: cleaned };
}

export async function fetchJsonWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const data = await response.json();
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

export function toApiError(code: ApiErrorCode, message: string): ApiErrorPayload {
  return { error: true, code, message };
}
