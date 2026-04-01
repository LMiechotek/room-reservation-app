"use client";

import { useState } from "react";
import Image from "next/image";
import { User, Mail, Shield, Lock } from "lucide-react";

type UserType = "professor" | "admin_cpd";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
};

export default function UserForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("professor");
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
        const errorText = await response.text();
        console.error("Erro backend:", errorText);
        alert("Erro ao cadastrar usuário");
        return;
      }

      alert("Usuário cadastrado com sucesso!");

      setName("");
      setEmail("");
      setPassword("");
      setUserType("professor");
      setErrors({});
    } catch (error) {
      console.error("Erro frontend:", error);
      alert("Erro ao cadastrar usuário");
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-linear-to-r from-blue-800 via-teal-400 to-teal-500 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md sm:max-w-lg p-6 sm:p-8">
        <div className="flex justify-center mb-4 sm:mb-6">
          <Image
            src="/images/unespar.png"
            alt="Logo"
            width={100}
            height={100}
            className="object-contain w-20 sm:w-24 md:w-28 h-auto"
            priority
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#1E3A8A] mb-6 sm:mb-8 leading-tight">
          Cadastro de Usuário / ADM
        </h1>

        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
              <User size={16} />
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 ${
                errors.name
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
              <Lock size={16} />
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className={`w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "focus:ring-blue-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
              <Shield size={16} />
              Tipo
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType)}
              className="w-full border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="professor">Professor</option>
              <option value="admin_cpd">Administrador</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg transition font-medium"
          >
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
}