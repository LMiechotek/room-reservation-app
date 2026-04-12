"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.warning("Informe o email");
      return;
    }
    if (!password.trim()) {
      toast.warning("Informe a senha");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email, senha: password }),
          credentials: "include", 
        }
      );

      if (!response.ok) {
        toast.error("Email ou senha inválidos");
      }

      const data = await response.json();

      authLogin({ id: data.usuario.id, tipo: data.usuario.tipo });

      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      }

      const redirectPath =
        data.usuario.tipo === "admin_cpd" ? "/admin" : "/rooms";

      toast.success("Login realizado com sucesso!");
      router.replace(redirectPath);

    } catch (error) {
      console.error("Erro login:", error);
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-linear-to-r from-blue-800 via-teal-400 to-teal-500 pt-28">
        <main className="min-h-[calc(100vh-112px)] flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="hidden lg:flex justify-center">
              <Image
                src="/images/logo-fusao-002.png"
                alt="Imagem institucional"
                width={500}
                height={500}
                className="w-full max-w-md h-auto object-contain"
                priority
              />
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <div className="flex justify-center mb-6">
                  <Image
                    src="/images/unespar.png"
                    alt="Logo UNESPAR"
                    width={100}
                    height={100}
                    className="w-24 h-auto object-contain"
                    priority
                  />
                </div>

                <h1 className="text-3xl font-bold text-center text-[#1E3A8A] mb-8">
                  Login
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-black">
                      Email
                    </label>
                    <input
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-black">
                      Senha
                    </label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Lembrar de mim
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white py-3 rounded-lg transition font-medium"
                  >
                    {loading ? "Entrando..." : "Entrar"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}