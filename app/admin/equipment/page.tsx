"use client";

import { useState } from "react";
import Image from "next/image";
import { Laptop, FileText, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

type FormErrors = {
  nome?: string;
  descricao?: string;
};

export default function EquipmentForm() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    const newErrors: FormErrors = {};

    if (!nome.trim()) {
      newErrors.nome = "O nome do equipamento é obrigatório";
    }

    if (!descricao.trim()) {
      newErrors.descricao = "A descrição é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      const payload = {
        nome,
        descricao,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/equipamentos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        toast.error("Erro ao cadastrar equipamento");
        return;
      }

      toast.success("Equipamento cadastrado com sucesso!");
      setNome("");
      setDescricao("");
      setErrors({});
    } catch (error) {
      console.error("Erro frontend:", error);
      toast.error("Erro ao cadastrar equipamento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <ToastContainer/>
      <div className="min-h-screen pt-24 bg-linear-to-br from-blue-900 via-blue-700 to-teal-500 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10">
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/30 p-5 sm:p-8">
          <div className="flex justify-center mb-5 sm:mb-6">
            <Image
              src="/images/unespar.png"
              alt="Logo"
              width={110}
              height={110}
              className="object-contain w-20 sm:w-24 md:w-28 h-auto"
              priority
            />
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
              Cadastro de Equipamento
            </h1>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">
              Cadastre os equipamentos disponíveis para as salas
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Laptop size={16} />
                Nome do equipamento
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setErrors((prev) => ({ ...prev, nome: "" }));
                }}
                placeholder="Ex: Lousa Digital"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.nome && (
                <p className="text-red-500 text-sm mt-1">{errors.nome}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <FileText size={16} />
                Descrição
              </label>
              <textarea
                value={descricao}
                onChange={(e) => {
                  setDescricao(e.target.value);
                  setErrors((prev) => ({ ...prev, descricao: "" }));
                }}
                placeholder="Ex: Lousa interativa com caneta óptica"
                rows={4}
                className="w-full border rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.descricao && (
                <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-70 text-white py-3 rounded-xl transition font-semibold shadow-lg"
            >
              <Save size={18} />
              {loading ? "Cadastrando..." : "Cadastrar Equipamento"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
