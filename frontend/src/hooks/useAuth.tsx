// AuthContext.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";


type AuthRole = "FREELANCER" | "ENTREPRISE" | "ADMIN";

type CurrentUser = {
  userId: number;
  name:string;
  email: string;
  role: AuthRole;
  freelancerId?: number | null;
  entrepriseId?: number | null;
  status?: string;
};

type AuthContextValue = {
  token: string | null;
  user: CurrentUser | null;
  loading: boolean;
  login: (token: string, user: CurrentUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const AUTH_STORAGE_KEY = "free-kaolo-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) { setLoading(false); return; }

    const { token: storedToken } = JSON.parse(stored);
    if (!storedToken ) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setLoading(false);
      return;
    }

    // Revalide auprès du backend (le rôle/statut a pu changer depuis)
    fetch("http://localhost:8080/api/auth/me", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then((freshUser: CurrentUser) => {
        setToken(storedToken);
        setUser(freshUser);
      })
      .catch(() => localStorage.removeItem(AUTH_STORAGE_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = (newToken: string, newUser: CurrentUser) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: newToken }));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}