"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Laptop, FileText, Save, Edit, Trash2, List, Plus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type FormErrors = { nome?: string; descricao?: string };

export default function EquipmentPanel() {
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipamentos`);
        if (!res.ok) throw new Error("Erro ao buscar equipamentos");
        const data = await res.json();
        setEquipments(data);
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar os equipamentos");
      }
    };
    fetchEquipments();
  }, []);

  const validateFields = () => {
    const newErrors: FormErrors = {};
    if (!nome.trim()) newErrors.nome = "O nome do equipamento é obrigatório";
    if (!descricao.trim()) newErrors.descricao = "A descrição é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    setLoading(true);
    toast.info("Salvando equipamento...", { autoClose: 1000 });

    try {
      const payload = { nome, descricao };
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/equipamentos/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/equipamentos`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        if (data?.message) toast.error(data.message);
        else if (data?.errors?.nome) toast.error(data.errors.nome);
        else toast.error("Erro ao salvar equipamento");
        return;
      }

      const updatedEquipment = await response.json();
      toast.success(editingId ? "Equipamento atualizado!" : "Equipamento cadastrado!");

      if (editingId) {
        setEquipments(
          equipments.map((eq) => (eq.id === updatedEquipment.id ? updatedEquipment : eq))
        );
      } else {
        setEquipments([...equipments, updatedEquipment]);
      }

      setNome("");
      setDescricao("");
      setEditingId(null);
      setErrors({});
      setActiveTab("list");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar equipamento");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (equipment: any) => {
    setNome(equipment.nome);
    setDescricao(equipment.descricao);
    setEditingId(equipment.id);
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const confirmDelete = (onConfirm: () => void) => {
    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-3">
          <span>Tem certeza que deseja excluir este equipamento?</span>
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              onClick={() => closeToast()}
            >
              Não
            </button>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => {
                onConfirm();
                closeToast();
              }}
            >
              Sim
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        position: "top-center",
      }
    );
  };

  const handleDelete = (id: string) => {
    confirmDelete(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipamentos/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          if (data?.message) toast.error(data.message);
          else toast.error("Erro ao excluir equipamento");
          return;
        }

        toast.success("Equipamento excluído com sucesso!");
        setEquipments(equipments.filter((eq) => eq.id !== id));
      } catch (error) {
        console.error(error);
        toast.error("Erro ao excluir equipamento");
      }
    });
  };

  return (
    <div className="min-h-screen pt-24 bg-linear-to-br from-blue-900 via-blue-700 to-teal-500 px-4 sm:px-6 py-8 sm:py-10">
      <ToastContainer />
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
              activeTab === "form" ? "bg-blue-700 text-white" : "bg-white text-blue-700"
            }`}
            onClick={() => setActiveTab("form")}
          >
            <Plus size={16} /> Cadastro
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
              activeTab === "list" ? "bg-blue-700 text-white" : "bg-white text-blue-700"
            }`}
            onClick={() => setActiveTab("list")}
          >
            <List size={16} /> Lista
          </button>
        </div>
        {activeTab === "form" && (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
            <div className="flex justify-center mb-5">
              <Image
                src="/images/unespar.png"
                alt="Logo"
                width={110}
                height={110}
                className="w-24 h-auto object-contain"
                priority
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] text-center mb-2">
              {editingId ? "Editar Equipamento" : "Cadastro de Equipamento"}
            </h1>
            <p className="text-gray-500 text-center mb-6">
              {editingId
                ? "Altere as informações do equipamento"
                : "Cadastre os equipamentos disponíveis para as salas"}
            </p>

            <div className="grid grid-cols-1 gap-5">
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
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
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
                {loading
                  ? "Salvando..."
                  : editingId
                  ? "Salvar Alterações"
                  : "Cadastrar Equipamento"}
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        {activeTab === "list" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Equipamentos cadastrados</h2>

            {equipments.length === 0 ? (
              <p className="text-gray-500">Nenhum equipamento cadastrado ainda.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {equipments.map((eq) => (
                  <li
                    key={eq.id}
                    className="flex flex-col justify-between bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{eq.nome}</p>
                      <p className="text-sm text-gray-500">{eq.descricao}</p>
                    </div>
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        className="flex items-center gap-1 text-yellow-600 hover:text-yellow-800 font-semibold"
                        onClick={() => handleEdit(eq)}
                      >
                        <Edit size={16} /> Editar
                      </button>
                      <button
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
                        onClick={() => handleDelete(eq.id)}
                      >
                        <Trash2 size={16} /> Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}