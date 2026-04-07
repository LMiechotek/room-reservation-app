"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Shield,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  List,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type UserType = "professor" | "admin_cpd";

type FormErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

type UserData = {
  id: string;
  nome: string;
  email: string;
  tipo: UserType;
  ativo?: boolean;
};

export default function UserPanel() {
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<UserType>("professor");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`);
        const data = await res.json();

        const activeUsers = data.filter((u: UserData) => u.ativo !== false);
        setUsers(activeUsers);
        
      } catch (error) {
        console.error(error);
        toast.error("Não foi possível carregar os usuários");
      }
    };
    fetchUsers();
  }, []);

  const validateFields = () => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = "O nome é obrigatório";
    if (!email.trim()) newErrors.email = "O email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Digite um email válido";

    if (!editingId) {
      if (!password.trim()) newErrors.password = "A senha é obrigatória";
      else if (password.length < 6) newErrors.password = "A senha deve ter no mínimo 6 caracteres";

      if (!confirmPassword.trim()) newErrors.confirmPassword = "Repita a senha";
      else if (confirmPassword !== password) newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;
    setLoading(true);

    try {
      const payload: any = { nome: name, email, tipo: userType };
      if (!editingId) payload.senha = password;

      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        toast.error("Erro ao salvar usuário");
        return;
      }

      const updatedUser = await response.json();
      toast.success(editingId ? "Usuário atualizado!" : "Usuário cadastrado!");

      if (editingId) {
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      } else {
        setUsers([...users, updatedUser]);
      }

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setUserType("professor");
      setErrors({});
      setEditingId(null);
      setActiveTab("list");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserData) => {
    setName(user.nome);
    setEmail(user.email);
    setUserType(user.tipo);
    setEditingId(user.id);
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este usuário?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Erro ao excluir usuário");
        return;
      }

      toast.success("Usuário excluído!");
      setUsers(users.filter((u) => u.id !== id));
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir usuário");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen pt-24 bg-linear-to-br from-blue-900 via-blue-700 to-teal-500 px-4 py-10">
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
            <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
              <div className="flex justify-center mb-6">
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
                {editingId ? "Editar Usuário" : "Cadastro de Usuário"}
              </h1>
              <p className="text-gray-500 text-center mb-6">
                {editingId
                  ? "Altere as informações do usuário"
                  : "Cadastre professores e administradores do sistema"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <User size={16} /> Nome
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
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Mail size={16} /> Email
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
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                {!editingId && (
                  <>
                    <div>
                      <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                        <Lock size={16} /> Senha
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
                        <CheckCircle2 size={16} /> Repita a senha
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme a senha"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                          }}
                          className="w-full border rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Shield size={16} /> Tipo de usuário
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
                  {editingId ? "Salvar Alterações" : "Cadastrar Usuário"}
                </button>
              </div>
            </div>
          )}
          {activeTab === "list" && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-700">Usuários cadastrados</h2>

              {users.length === 0 ? (
                <p className="text-gray-500">Nenhum usuário cadastrado ainda.</p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {users.map((u) => (
                    <li
                      key={u.id}
                      className="flex flex-col justify-between bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{u.nome}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                        <p className="text-sm text-gray-500 capitalize">{u.tipo}</p>
                      </div>
                      <div className="flex justify-end gap-3 mt-3">
                        <button
                          className="flex items-center gap-1 text-yellow-600 hover:text-yellow-800 font-semibold"
                          onClick={() => handleEdit(u)}
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
                          onClick={() => handleDelete(u.id)}
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
    </>
  );
}