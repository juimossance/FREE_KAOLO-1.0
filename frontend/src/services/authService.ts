export async function login(email: string, password: string) {

  const res = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  const { accessToken } = await res.json();
  // Source de vérité = le backend, pas le payload décodé
  const meRes = await fetch("http://localhost:8080/api/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!meRes.ok) throw new Error("Impossible de récupérer le profil");
  const user = await meRes.json(); // { userId, role, freelancerId, entrepriseId, status... }
  return { accessToken, user };
}