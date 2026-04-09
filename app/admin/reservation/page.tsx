"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  BookOpen,
  CalendarDays,
  Clock3,
  X,
  Edit,
  List,
  Plus,
  Save,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";

type Room = {
  id: string;
  nome_numero: string;
  bloco: string;
};

type UserType = {
  id: string;
  nome: string;
  tipo: string;
};

type Reservation = {
  id: string;
  sala_id: string;
  usuario_id: string;
  criado_por?: string;
  data: string;
  turno: string;
  aula_numero: number;
  disciplina: string;
  nome_numero?: string;
  bloco?: string;
  usuario_nome?: string;
  status?: string;
};

type SlotInfo = {
  hora_inicio: string;
  hora_fim: string;
};

type HorariosResponse = Record<string, Record<string, SlotInfo>>;

export default function AdminReservationPanel() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [turno, setTurno] = useState("matutino");
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [horarios, setHorarios] = useState<HorariosResponse>({});
  const [takenSlots, setTakenSlots] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [roomsRes, usersRes, reservationsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/salas`, { credentials: "include" }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`, { credentials: "include" }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas`, { credentials: "include" }),
        ]);

        const [roomsData, usersData, reservationsData] = await Promise.all([
          roomsRes.json(),
          usersRes.json(),
          reservationsRes.json(),
        ]);

        setRooms(roomsData);
        setUsers(usersData);
        setReservations(reservationsData);

        setSelectedRoomId("");
        setSelectedUserId("");
      } catch {
        toast.error("Erro ao carregar dados");
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/horarios`,
          { credentials: "include" }
        );
        if (res.ok) setHorarios(await res.json());
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
      }
    };
    fetchHorarios();
  }, []);

  useEffect(() => {
    setSelectedLessons([]);
    setTakenSlots([]);
    if (!date || !selectedRoomId) return;

    const taken = reservations
      .filter(
        (r) =>
          r.sala_id === selectedRoomId &&
          r.data.slice(0, 10) === date &&
          r.turno === turno &&
          (r.status === "ativa" || r.status === "aberta") &&
          r.id !== editingId
      )
      .map((r) => r.aula_numero);

    setTakenSlots(taken);
  }, [date, turno, selectedRoomId, reservations, editingId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetForm = () => {
    setSelectedRoomId("");
    setSelectedUserId(users[0]?.id || "");
    setSubject("");
    setDate("");
    setTurno("matutino");
    setSelectedLessons([]);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!selectedRoomId || !selectedUserId || !subject || !date) {
      toast.warning("Preencha todos os campos obrigatórios!");
      return;
    }

    if (selectedLessons.length === 0) {
      toast.warning("Selecione pelo menos um horário.");
      return;
    }

    if (date < today) {
      toast.warning("Não é possível reservar em datas passadas.");
      return;
    }

    setLoading(true);
    toast.info("Salvando reserva...", { autoClose: 1000 });

    try {
      const sorted = [...selectedLessons].sort((a, b) => a - b);

      if (editingId) {
        const payload = {
          sala_id: selectedRoomId,
          usuario_id: selectedUserId,
          data: date,
          turno,
          aula_numero: sorted[0],
          disciplina: subject,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${editingId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          }
        );

        const result = await response.json();
        if (!response.ok) throw new Error(result?.message || "Erro ao atualizar reserva");

        toast.success("Reserva atualizada!");
        setReservations((prev) => prev.map((r) => (r.id === result.id ? result : r)));
      } else {
        const created: Reservation[] = [];

        for (const aulaNumero of sorted) {
          const payload = {
            sala_id: selectedRoomId,
            usuario_id: selectedUserId,
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
              body: JSON.stringify(payload),
              credentials: "include",
            }
          );

          const result = await response.json();
          if (!response.ok) throw new Error(result?.message || `Erro ao criar reserva para aula ${aulaNumero}`);

          created.push(result);
        }

        toast.success("Reserva criada!");
        setReservations((prev) => [...prev, ...created]);
      }

      resetForm();
      setActiveTab("list");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar reserva");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reservation: Reservation) => {
    setSubject(reservation.disciplina);
    setSelectedRoomId(reservation.sala_id);
    setSelectedUserId(reservation.usuario_id);
    setDate(reservation.data.slice(0, 10));
    setTurno(reservation.turno);
    setSelectedLessons([reservation.aula_numero]);
    setEditingId(reservation.id);
    setActiveTab("form");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = (reservation: Reservation) => {
    if (reservation.status === "cancelada") return;

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col gap-2">
          <p>Deseja realmente cancelar esta reserva?</p>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              onClick={() => closeToast()}
            >
              Não
            </button>
            <button
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={async () => {
                closeToast();
                try {
                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${reservation.id}/cancelar`,
                    {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ cancelado_por: reservation.usuario_id }),
                      credentials: "include", 
                    }
                  );

                  const result = await response.json();
                  if (!response.ok) throw new Error(result?.message || "Erro ao cancelar");

                  toast.success("Reserva cancelada!");
                  setReservations((prev) =>
                    prev.map((r) =>
                      r.id === reservation.id ? { ...r, status: "cancelada" } : r
                    )
                  );
                } catch (error: any) {
                  toast.error(error.message || "Erro ao cancelar");
                }
              }}
            >
              Sim
            </button>
          </div>
        </div>
      ),
      { 
        autoClose: false,
        position: "top-center",
      }
    );
  };

  const turnoColors = {
    matutino: "bg-yellow-200 text-yellow-700",
    vespertino: "bg-orange-200 text-orange-700",
    noturno: "bg-indigo-200 text-indigo-700",
  };

  return (
    <div className="min-h-screen pt-24 bg-linear-to-br from-blue-900 via-blue-700 to-teal-500 px-4 sm:px-6 py-8 sm:py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition ${
              activeTab === "form" ? "bg-blue-700 text-white" : "bg-white text-blue-700"
            }`}
          >
            <Plus size={16} /> Cadastro
          </button>

          <button
            onClick={() => setActiveTab("list")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition ${
              activeTab === "list" ? "bg-blue-700 text-white" : "bg-white text-blue-700"
            }`}
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

            <h2 className="text-3xl font-bold text-[#1E3A8A] text-center mb-6">
              {editingId ? "Editar Reserva" : "Cadastro de Reserva"}
            </h2>
            <p className="text-gray-500 text-center mb-6">
              Preencha os dados abaixo para reservar a sala de forma rápida e organizada.
            </p>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                  <BookOpen size={18} />
                  Sala
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="" disabled>
                    Selecione uma sala
                  </option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.nome_numero} - {room.bloco}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                  <User size={18} />
                  Professor(a)
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                >
                  <option value="" disabled>
                    Selecione um(a) professor(a)
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                  <BookOpen size={18} />
                  Disciplina
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Ex: Computação I"
                />
              </div>
              <div className="flex gap-4 items-stretch">
                <div className="flex-1 flex flex-col">
                  <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                    <CalendarDays size={18} />
                    Data
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={today}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 flex-1"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                    <Clock3 size={18} />
                    Turno
                  </label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3 flex-1"
                  >
                    <option value="matutino">Matutino</option>
                    <option value="vespertino">Vespertino</option>
                    <option value="noturno">Noturno</option>
                  </select>
                </div>
              </div>

              <div ref={dropdownRef}>
                <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                  <Clock3 size={18} />
                  Horários
                </label>
                <div
                  className="w-full border rounded-xl px-3 py-2 min-h-[48px] flex flex-wrap gap-1 items-center cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                >
                  {selectedLessons.length === 0 && (
                    <span className="text-gray-400 text-sm select-none">
                      {date && selectedRoomId ? "Selecione os horários..." : "Selecione sala e data primeiro"}
                    </span>
                  )}
                  {selectedLessons
                    .slice()
                    .sort((a, b) => a - b)
                    .map((num) => {
                      const slotInfo = horarios[turno]?.[String(num)];
                      if (!slotInfo) return null;
                      const label = `${slotInfo.hora_inicio}-${slotInfo.hora_fim}`;
                      return (
                        <span
                          key={num}
                          className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                        >
                          {label}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLessons((prev) => prev.filter((n) => n !== num));
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

                {dropdownOpen && horarios[turno] && (
                  <div className="border border-gray-200 rounded-xl mt-1 shadow-lg bg-white overflow-hidden relative z-10">
                    {Object.entries(horarios[turno]).map(([num, info]) => {
                      const numero = Number(num);
                      const isSelected = selectedLessons.includes(numero);
                      const isTaken = takenSlots.includes(numero);
                      const label = `${info.hora_inicio}-${info.hora_fim}`;
                      return (
                        <div
                          key={num}
                          onClick={() => {
                            if (isTaken) return;
                            setSelectedLessons((prev) =>
                              prev.includes(numero)
                                ? prev.filter((n) => n !== numero)
                                : [...prev, numero]
                            );
                          }}
                          className={`flex items-center justify-between px-4 py-2 text-sm transition-colors
                            ${isTaken
                              ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-blue-50 text-blue-700 font-medium cursor-pointer hover:bg-blue-100"
                              : "text-gray-700 cursor-pointer hover:bg-blue-50"
                            }`}
                        >
                          <span>{label}</span>
                          {isTaken && <span className="text-xs text-red-400 font-medium">Ocupado</span>}
                          {isSelected && !isTaken && <span className="text-blue-600 font-bold text-base leading-none">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-70 text-white py-3 rounded-xl transition font-semibold shadow-lg"
              >
                <Save size={18} />
                {loading
                  ? "Salvando..."
                  : editingId
                    ? "Salvar Alterações"
                    : "Confirmar Reserva"}
              </button>
            </div>
          </div>
        )}
        {activeTab === "list" && (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Reservas existentes
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Visualize, edite ou cancele reservas cadastradas.
              </p>
            </div>

            {reservations.length === 0 ? (
              <p className="text-gray-500">Nenhuma reserva cadastrada.</p>
            ) : (
              <ul className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {reservations.map((r) => {
                  const creator = users.find((u) => u.id === r.criado_por);

                  return (
                    <li
                      key={r.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-gray-800">
                              {r.nome_numero}
                            </h4>
                            <p className="text-sm text-gray-500">{r.bloco}</p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              turnoColors[r.turno as keyof typeof turnoColors] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {r.turno}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Disciplina</p>
                          <p className="font-semibold text-blue-800 text-lg">
                            {r.disciplina}
                          </p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">
                              Professor:
                            </span>{" "}
                            {r.usuario_nome}
                          </p>

                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">
                              Data:
                            </span>{" "}
                            {r.data.slice(0, 10)}
                          </p>

                          <p className="text-gray-600">
                            <span className="font-medium text-gray-800">
                              Aula:
                            </span>{" "}
                            {r.aula_numero}
                          </p>

                          {creator && creator.nome !== r.usuario_nome && (
                            <p className="text-gray-600">
                              <span className="font-medium text-gray-800">
                                Criado por:
                              </span>{" "}
                              {creator.nome}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-5">
                        <button
                          className="flex-1 flex items-center justify-center gap-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 py-2 rounded-xl font-semibold transition"
                          onClick={() => handleEdit(r)}
                        >
                          <Edit size={16} />
                          Editar
                        </button>

                        <button
                          disabled={r.status === "cancelada"}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition ${
                            r.status === "cancelada"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }`}
                          onClick={() => confirmDelete(r)}
                        >
                          <X size={16} />
                          {r.status === "cancelada" ? "Cancelada" : "Cancelar"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}