"use client";

import { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: string;
  tipo: string;
  nome?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/user", {
          credentials: "include",
        });

        if (res.status === 401) {
          setUser(null);
          setLoading(false); 
          return;
        }

        const data = await res.json();

        setUser({
          id: data.id,
          tipo: data.tipo,
          nome: data.nome,
        });
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login() {
    setLoading(true);
    
    const res = await fetch("/api/auth/user", {
      credentials: "include",
    });

    const data = await res.json();

    setUser(data);
    setLoading(false);
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);