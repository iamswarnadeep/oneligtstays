import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined=loading, null=guest, object=user

  const fetchMe = useCallback(async () => {
    const t = localStorage.getItem("ols_token");
    if (!t) { setUser(null); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("ols_token");
      setUser(null);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const loginWithToken = (token, u) => {
    localStorage.setItem("ols_token", token);
    setUser(u);
  };
  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("ols_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, loginWithToken, logout, refresh: fetchMe }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
