const API_BASE = import.meta.env.VITE_API_URL;

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | null = null;

  try {
    const auth = localStorage.getItem("free-kaolo-auth");
    token = auth ? JSON.parse(auth).token : null;
  } catch {
    token = null;
  }

  // avec FormData le navigateur gère le Content-Type
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || `Erreur HTTP ${response.status}`;

    try {
      const parsed = JSON.parse(errorText);
      if (parsed && typeof parsed.message === "string" && parsed.message) {
        message = parsed.message;
      }
    } catch {
      // pas du JSON, on garde le texte brut
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";

  if (
    contentType.includes("application/pdf") ||
    contentType.includes("application/octet-stream") ||
    contentType.includes("image/")
  ) {
    return response.blob() as Promise<T>;
  }

  return response.json() as Promise<T>;
}
