import { useState, useEffect } from "react";
import { apiMe, apiLogout, User } from "./api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiMe()
      .then((u) => setUser(u))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = (u: User) => setUser(u);

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return { user, loading, login, logout };
}