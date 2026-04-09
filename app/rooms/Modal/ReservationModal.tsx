"use client";

import { useState, useEffect } from "react";
import { User, BookOpen, CalendarDays, Clock3 } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  roomId: string;
  onClose: () => void;
  onCreated: () => void;
};

type UserType = {
  id: string;
  nome: string;
  tipo: string;
};

export default function ReservationModal({
  roomId,
  onClose,
  onCreated,
}: Props) {
  const { user } = useAuth();

  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [turno, setTurno] = useState("matutino");
  const [lessonNumber, setLessonNumber] = useState(1);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.tipo === "admin_cpd";

  const today = new Date().toISOString().split("T")[0];
  const lastDayOfMonth = (() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  })();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error("Erro ao carregar professores.");
          return;
        }

        const professores = data.filter(
          (u: UserType) => u.tipo === "professor"
        );

        setUsers(professores);

        if (professores.length > 0) {
          setSelectedUserId(professores[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error("Erro ao buscar professores.");
      }
    };

    fetchUsers();
  }, [isAdmin]);

  const handleSubmit = async () => {
    if (!subject.trim() || !date) {
      toast.warning("Preencha disciplina e data.");
      return;
    }

    if (!user?.id) {
      toast.error("Usuário não autenticado.");
      return;
    }

    if (isAdmin && !selectedUserId) {
      toast.warning("Selecione um professor.");
      return;
    }

    if (date < today) {
      toast.warning("Não é possível reservar em datas passadas.");
      return;
    }

    if (!isAdmin && date > lastDayOfMonth) {
      toast.warning("Professores só podem reservar dentro do mês corrente.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Criando reserva...");

      const payload = {
        sala_id: roomId,
        usuario_id: isAdmin ? selectedUserId : user.id,
        criado_por: user.id,
        data: date,
        turno,
        aula_numero: lessonNumber,
        disciplina: subject,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result?.message || "Erro ao reservar sala.");
        return;
      }
      
      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao realizar reserva.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
        onClick={handleBackgroundClick}
      >
        <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
          <div className="flex flex-col items-center p-6 border-b border-gray-200">
            <Image
              src="/images/unespar.png"
              alt="Logo UNESPAR"
              width={110}
              height={110}
              className="object-contain w-20 sm:w-24 md:w-28 h-auto"
            />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] mt-2">
              Reservar Sala
            </h2>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {isAdmin && (
              <div>
                <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
                  <User size={16} />
                  Professor responsável
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
                <BookOpen size={16} />
                Disciplina
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
                <CalendarDays size={16} />
                Data
              </label>
              <input
                type="date"
                value={date}
                min={today}
                max={!isAdmin ? lastDayOfMonth : undefined}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
                <Clock3 size={16} />
                Turno
              </label>
              <select
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="matutino">Matutino</option>
                <option value="vespertino">Vespertino</option>
                <option value="noturno">Noturno</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-black mb-2 block">
                Aula número
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={lessonNumber}
                onChange={(e) => setLessonNumber(Number(e.target.value))}
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition font-semibold"
            >
              {loading ? "Reservando..." : "Confirmar"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border bg-red-500 hover:bg-red-600 text-white border-gray-300 py-2 rounded-lg  transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}