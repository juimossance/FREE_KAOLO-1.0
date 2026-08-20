// src/utils/jwt.ts
export function decodeJwt(token: string) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      userId: Number(payload.sub),
      role: payload.role,
      entrepriseId: payload.entrepriseId ? Number(payload.entrepriseId) : null,
      freelancerId: payload.freelancerId ? Number(payload.freelancerId) : null,
    };
  } catch {
    return null;
  }
}
export function getCurrentUser() {
  const authStr = localStorage.getItem("free-kaolo-auth");
  if (!authStr) return null;

  try {
    const auth = JSON.parse(authStr);
    const token = auth.token;
    if (!token) return null;

    const decoded = decodeJwt(token);
    if (!decoded) return null;

    return {
      token,
      ...decoded,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de l'utilisateur :", error);
    return null;
  }
}