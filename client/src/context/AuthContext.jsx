import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from token on first load.
  useEffect(() => {
    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api.get("/auth/me");
        setUser(user);
      } catch {
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    restore();
  }, []);

  function applyAuth({ token, user }) {
    setToken(token);
    setUser(user);
  }

  async function login(email, password) {
    const data = await api.post("/auth/login", { email, password }, { auth: false });
    applyAuth(data);
    return data.user;
  }

  async function register(payload) {
    const data = await api.post("/auth/register", payload, { auth: false });
    applyAuth(data);
    return data.user;
  }

  async function childLogin(childId) {
    const data = await api.post("/auth/child-login", { childId }, { auth: false });
    applyAuth(data);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  const value = { user, loading, login, register, childLogin, logout, setUser };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
