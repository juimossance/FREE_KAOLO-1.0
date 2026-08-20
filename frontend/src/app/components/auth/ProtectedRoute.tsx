// src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { LoadingScreen } from "./LoadingScreen";

export type AuthRole = "FREELANCER" | "ENTREPRISE" | "ADMIN";

export function ProtectedRoute({ allowedRoles }: { allowedRoles: AuthRole[] }) {
  const { token, user, loading } = useAuth();

  // Le temps que /api/auth/me réponde, on n'affiche rien de sensible
  if (loading) return <LoadingScreen />;

  // Pas de token ou pas d'utilisateur validé → login
  if (!token || !user) return <Navigate to="/login" replace />;

  // Rôle non autorisé pour cette zone → login (jamais la page ciblée)
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

  return <Outlet />;
}