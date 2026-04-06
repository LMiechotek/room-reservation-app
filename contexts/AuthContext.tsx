"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  tipo: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userType = localStorage.getItem("userType");

    if (token && userId && userType) {
      setUser({
        id: userId,
        tipo: userType,
      });
    }

    setLoading(false);
  }, []);

  function login(userData: User, token: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userData.id);
    localStorage.setItem("userType", userData.tipo);

    setUser(userData);
  }

  function logout() {
    localStorage.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}