"use client";

import { useState, useEffect } from "react";
import {
  User,
  BookOpen,
  CalendarDays,
  Clock3,
  Check,
  X,
  Edit,
  List,
  Plus,
  Save
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
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
  const [lessonNumber, setLessonNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

        if (roomsData.length > 0) setSelectedRoomId(roomsData[0].id);
        if (usersData.length > 0) setSelectedUserId(usersData[0].id);
      } catch {
        toast.error("Erro ao carregar dados");
      }
    };

    fetchInitialData();
  }, []);

  const resetForm = () => {
    setSelectedRoomId(rooms[0]?.id || "");
    setSelectedUserId(users[0]?.id || "");
    setSubject("");
    setDate("");
    setTurno("matutino");
    setLessonNumber(1);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!selectedRoomId || !selectedUserId || !subject || !date) {
      toast.warning("Preencha todos os campos obrigatórios!");
      return;
    }

    const conflict = reservations.find(
      (r) =>
        r.sala_id === selectedRoomId &&
        r.data.slice(0, 10) === date &&
        r.turno === turno &&
        r.aula_numero === lessonNumber &&
        r.id !== editingId
    );

    if (conflict) {
      toast.error(
        `Conflito! Sala já reservada para aula ${lessonNumber} no turno ${turno}.`
      );
      return;
    }

    setLoading(true);
    toast.info("Salvando reserva...", { autoClose: 1000 });

    try {
      const payload = {
        sala_id: selectedRoomId,
        usuario_id: selectedUserId,
        data: date,
        turno,
        aula_numero: lessonNumber,
        disciplina: subject
      };

      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", 
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Erro ao salvar reserva");
      }

      toast.success(editingId ? "Reserva atualizada!" : "Reserva criada!");

      if (editingId) {
        setReservations((prev) =>
          prev.map((r) => (r.id === result.id ? result : r))
        );
      } else {
        setReservations((prev) => [...prev, result]);
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
    setLessonNumber(reservation.aula_numero);
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
    matutino: "bg-yellow-100 text-yellow-700",
    vespertino: "bg-orange-100 text-orange-700",
    noturno: "bg-indigo-100 text-indigo-700",
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
                    Professor
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3"
                  >
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
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                    <CalendarDays size={18} />
                    Data
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                    <Clock3 size={18} />
                    Turno
                  </label>
                  <select
                    value={turno}
                    onChange={(e) => setTurno(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3"
                  >
                    <option value="matutino">Matutino</option>
                    <option value="vespertino">Vespertino</option>
                    <option value="noturno">Noturno</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                    <Check size={18} />
                    Número da Aula
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={lessonNumber}
                    onChange={(e) => setLessonNumber(Number(e.target.value))}
                    className="w-full border rounded-xl px-4 py-3"
                  />
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
                            className="flex-1 flex items-center justify-center gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 py-2 rounded-xl font-semibold transition"
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
                                : "bg-red-50 text-red-700 hover:bg-red-100"
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