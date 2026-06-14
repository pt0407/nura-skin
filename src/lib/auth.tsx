import { createContext, useContext, useState, useEffect, type ReactNode, type ReactElement } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export interface User {
  email: string;
  name: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => void;
  continueAsGuest: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "nura_token";

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function fetchUser(token: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user as User;
  } catch {
    return null;
  }
}

function parseJwtUser(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { email: payload.email, name: payload.name, isGuest: payload.isGuest };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get("token");
    if (tokenFromUrl) {
      setStoredToken(tokenFromUrl);
      const parsed = parseJwtUser(tokenFromUrl);
      if (parsed) setUser(parsed);
      url.searchParams.delete("token");
      url.searchParams.delete("name");
      url.searchParams.delete("email");
      window.history.replaceState({}, "", url.toString());
      setLoading(false);
      return;
    }

    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchUser(token).then((u) => {
      if (u) setUser(u);
      else setStoredToken(null);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return false;
      setStoredToken(data.token);
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return false;
      setStoredToken(data.token);
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const loginWithGoogle = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const continueAsGuest = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/guest`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) return false;
      setStoredToken(data.token);
      setUser(data.user);
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
  };

  const isGuest = !!user?.isGuest;

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isGuest, loginWithGoogle, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
