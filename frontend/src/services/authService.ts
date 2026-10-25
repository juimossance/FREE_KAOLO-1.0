import { apiFetch } from "./http";

export async function login(email: string, password: string) {
  const { accessToken } = await apiFetch<{ accessToken: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );

  // Source de vérité = le backend, pas le payload décodé.
  // Le token n'est pas encore dans le localStorage, donc on le passe
  // explicitement : les headers de `options` écrasent ceux par défaut.
  const user = await apiFetch<{
    userId: number;
    role: string;
    freelancerId?: number;
    entrepriseId?: number;
    status: string;
  }>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return { accessToken, user };
}
