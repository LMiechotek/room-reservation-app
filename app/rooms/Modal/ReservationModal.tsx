"use client";

import { useState, useEffect, useRef } from "react";
import { User, BookOpen, CalendarDays, Clock3, ChevronDown, X } from "lucide-react";
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

type SlotInfo = {
  hora_inicio: string;
  hora_fim: string;
};

type HorariosResponse = Record<string, Record<string, SlotInfo>>;

type ExistingReservation = {
  sala_id: string;
  data: string;
  turno: string;
  aula_numero: number;
  status: string;
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
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [horarios, setHorarios] = useState<HorariosResponse>({});
  const [takenSlots, setTakenSlots] = useState<number[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.tipo === "admin_cpd";

  const today = new Date().toISOString().split("T")[0];
  const lastDayOfMonth = (() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  })();

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/horarios`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data: HorariosResponse = await response.json();
          setHorarios(data);
        }
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
      }
    };

    fetchHorarios();
  }, []);

  useEffect(() => {
    setSelectedLessons([]);
    setTakenSlots([]);

    if (!date) return;

    const fetchTakenSlots = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`,
          { credentials: "include" }
        );
        if (!response.ok) return;

        const data: ExistingReservation[] = await response.json();

        const taken = data
          .filter(
            (r) =>
              r.sala_id === roomId &&
              r.data.slice(0, 10) === date &&
              r.turno === turno &&
              (r.status === "ativa" || r.status === "aberta")
          )
          .map((r) => r.aula_numero);

        setTakenSlots(taken);
      } catch (error) {
        console.error("Erro ao buscar reservas existentes:", error);
      }
    };

    fetchTakenSlots();
  }, [date, turno, roomId]);

  useEffect(() => {
    setSelectedLessons((prev) => prev.filter((n) => !takenSlots.includes(n)));
  }, [takenSlots]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`,
          { credentials: "include" }
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error("Erro ao carregar professores.");
          return;
        }

        const professores = data.filter((u: UserType) => u.tipo === "professor");
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

  const currentSlots = horarios[turno]
    ? Object.entries(horarios[turno]).map(([num, info]) => ({
        numero: Number(num),
        horario: `${info.hora_inicio}-${info.hora_fim}`,
      }))
    : [];

  const toggleLesson = (numero: number) => {
    if (takenSlots.includes(numero)) return;
    setSelectedLessons((prev) =>
      prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero]
    );
  };

  const removeLesson = (numero: number) => {
    setSelectedLessons((prev) => prev.filter((n) => n !== numero));
  };

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
      toast.warning("Professores só podem reservar até o último dia do mês corrente.");
      return;
    }


    if (selectedLessons.length === 0) {
      toast.warning("Selecione pelo menos um horário.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Criando reserva...");

      const sorted = [...selectedLessons].sort((a, b) => a - b);

      for (const aulaNumero of sorted) {
        const payload = {
          sala_id: roomId,
          usuario_id: isAdmin ? selectedUserId : user.id,
          criado_por: user.id,
          data: date,
          turno,
          aula_numero: aulaNumero,
          disciplina: subject,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          toast.error(result?.message || `Erro ao reservar aula ${aulaNumero}.`);
          return;
        }
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

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
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
              max={isAdmin ? undefined : lastDayOfMonth}
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

          <div ref={dropdownRef}>
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
              <Clock3 size={16} />
              Horários
            </label>
            <div
              className="w-full border rounded-lg px-3 py-2 outline-none focus-within:ring-2 focus-within:ring-blue-500 cursor-pointer min-h-[42px] flex flex-wrap gap-1 items-center"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {selectedLessons.length === 0 && (
                <span className="text-gray-400 text-sm select-none">
                  {date ? "Selecione os horários..." : "Selecione uma data primeiro"}
                </span>
              )}
              {selectedLessons
                .slice()
                .sort((a, b) => a - b)
                .map((num) => {
                  const slot = currentSlots.find((s) => s.numero === num);
                  if (!slot) return null;
                  return (
                    <span
                      key={num}
                      className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                    >
                      {slot.horario}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLesson(num);
                        }}
                        className="hover:text-blue-600"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              <ChevronDown
                size={16}
                className={`ml-auto text-gray-400 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </div>

            {dropdownOpen && currentSlots.length > 0 && (
              <div className="border border-gray-200 rounded-lg mt-1 shadow-lg bg-white overflow-hidden relative z-10">
                {currentSlots.map((slot) => {
                  const isSelected = selectedLessons.includes(slot.numero);
                  const isTaken = takenSlots.includes(slot.numero);
                  return (
                    <div
                      key={slot.numero}
                      onClick={() => !isTaken && toggleLesson(slot.numero)}
                      className={`flex items-center justify-between px-4 py-2 text-sm transition-colors
                        ${isTaken
                          ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                          : isSelected
                          ? "bg-blue-50 text-blue-700 font-medium cursor-pointer hover:bg-blue-100"
                          : "text-gray-700 cursor-pointer hover:bg-blue-50"
                        }`}
                    >
                      <span>{slot.horario}</span>
                      {isTaken && (
                        <span className="text-xs text-red-400 font-medium">Ocupado</span>
                      )}
                      {isSelected && !isTaken && (
                        <span className="text-blue-600 font-bold text-base leading-none">✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
            className="flex-1 border bg-red-500 hover:bg-red-600 text-white border-gray-300 py-2 rounded-lg transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
