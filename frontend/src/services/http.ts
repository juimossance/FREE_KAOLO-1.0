// src/services/http.ts
const API_BASE = "http://localhost:8080/api"; // À adapter

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // ✅ Récupère automatiquement le token du localStorage
  const token = localStorage.getItem("free-kaolo-auth")
    ? JSON.parse(localStorage.getItem("free-kaolo-auth")!).token
    : null;

  // ✅ Ne PAS fixer Content-Type quand le body est un FormData (upload de
  // fichier) : le navigateur doit générer lui-même la boundary multipart.
  // Le fixer manuellement, même avec la bonne valeur, casse l'upload.
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // ✅ Envoie la requête
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // ✅ Gère les erreurs — tente d'extraire le champ "message" du JSON
  // renvoyé par GlobalExceptionHandler (ApiError), sinon garde le texte brut.
  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || `Erreur HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed && typeof parsed.message === "string") {
        message = parsed.message;
      }
    } catch {
      // Le body n'était pas du JSON — on garde le texte brut.
    }
    throw new Error(message);
  }

  // ✅ Retourne les données
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}