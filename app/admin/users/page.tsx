"use client";

import { useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Shield,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

type UserType = "professor" | "admin_cpd";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function UserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("professor");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateFields = () => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "O nome é obrigatório";
    }

    if (!email.trim()) {
      newErrors.email = "O email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Digite um email válido";
    }

    if (!password.trim()) {
      newErrors.password = "A senha é obrigatória";
    } else if (password.length < 6) {
      newErrors.password = "A senha deve ter no mínimo 6 caracteres";
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Repita a senha";
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    try {
      const payload = {
        nome: name,
        email,
        senha: password,
        tipo: userType,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        toast.error("Erro ao cadastrar usuário");
        return;
      }

      toast.success("Usuário cadastrado com sucesso!");

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUserType("professor");
      setErrors({});
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cadastrar usuário");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen pt-24 bg-linear-to-br from-blue-900 via-blue-700 to-teal-500 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 p-4 sm:p-6 md:p-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/unespar.png"
              alt="Logo"
              width={110}
              height={110}
              className="object-contain w-20 sm:w-24 md:w-28 h-auto"
              priority
            />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
              Cadastro de Usuário
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Cadastre professores e administradores do sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <User size={16} />
                Nome
              </label>
              <input
                type="text"
                placeholder="Digite o nome completo"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Mail size={16} />
                Email
              </label>
              <input
                type="email"
                placeholder="Digite o email institucional"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Lock size={16} />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite a senha"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className="w-full border rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <CheckCircle2 size={16} />
                Repita a senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme a senha"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      confirmPassword: "",
                    }));
                  }}
                  className="w-full border rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Shield size={16} />
                Tipo de usuário
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as UserType)}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="professor">Professor</option>
                <option value="admin_cpd">Administrador</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="md:col-span-2 w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl transition font-semibold shadow-lg"
            >
              Cadastrar Usuário
            </button>
          </div>
        </div>
      </div>
    </>
  );
}