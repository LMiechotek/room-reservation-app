"use client";

import { useState, useEffect } from "react";
import { User, BookOpen, CalendarDays, Clock3, FileText, Check, X, Edit } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";

type Room = {
  id: string;
  nome_numero: string;
  bloco: string;
};

type Reservation = {
  id: string;
  sala_id: string;
  usuario_id: string;
  data: string;
  turno: string;
  aula_numero: number;
  motivo: string;
};

export default function AdminReservationPanel() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [responsibleName, setResponsibleName] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [turno, setTurno] = useState("matutino");
  const [lessonNumber, setLessonNumber] = useState(1);
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/salas`);
        const data = await res.json();
        setRooms(data);
        if (data.length > 0) setSelectedRoomId(data[0].id);
      } catch {
        toast.error("Não foi possível carregar as salas");
      }
    };

    const fetchReservations = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas`);
        const data = await res.json();
        setReservations(data);
      } catch {
        toast.error("Não foi possível carregar as reservas");
      }
    };

    fetchRooms();
    fetchReservations();
  }, []);

  const resetForm = () => {
    setResponsibleName("");
    setSubject("");
    setDate("");
    setTurno("matutino");
    setLessonNumber(1);
    setObservation("");
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!selectedRoomId || !responsibleName || !subject || !date) {
      toast.warning("Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      const usuarioId = localStorage.getItem("userId") || "admin";
      const payload = {
        sala_id: selectedRoomId,
        usuario_id: usuarioId,
        criado_por: usuarioId,
        data: date,
        turno,
        aula_numero: lessonNumber,
        motivo: `${subject} - ${responsibleName}${observation ? " - " + observation : ""}`,
      };

      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error();

      const updatedReservation = await response.json();
      toast.success(editingId ? "Reserva atualizada!" : "Reserva criada!");

      if (editingId) {
        setReservations(
          reservations.map((r) => (r.id === updatedReservation.id ? updatedReservation : r))
        );
      } else {
        setReservations([...reservations, updatedReservation]);
      }

      resetForm();
    } catch {
      toast.error("Erro ao salvar reserva");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reservation: Reservation) => {
    const [subjectName, responsible, ...obs] = reservation.motivo.split(" - ");
    setSubject(subjectName);
    setResponsibleName(responsible);
    setObservation(obs.join(" - "));
    setSelectedRoomId(reservation.sala_id);
    setDate(reservation.data.slice(0, 10));
    setTurno(reservation.turno);
    setLessonNumber(reservation.aula_numero);
    setEditingId(reservation.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta reserva?")) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      toast.success("Reserva excluída!");
      setReservations(reservations.filter((r) => r.id !== id));
    } catch {
      toast.error("Erro ao excluir reserva");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen pt-24 bg-linear-to-br from-blue-900 via-blue-700 to-teal-500 px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-4xl mx-auto space-y-10">
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

            <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
              {editingId ? "Editar Reserva" : "Cadastro de Reserva"}
            </h2>
            <p className="text-gray-500 text-center mb-6">
              {editingId
                ? "Altere as informações da reserva"
                : "Cadastre novas reservas de salas facilmente"}
            </p>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="text-sm font-medium mb-1 block text-gray-500">Sala</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-400 text-gray-700 placeholder-gray-400"
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.nome_numero} - {room.bloco}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-500">
                  <User size={16} /> Nome do responsável
                </label>
                <input
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-400 text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-500">
                  <BookOpen size={16} /> Disciplina
                </label>
                <input
                  type="text"
                  placeholder="Ex: Matemática"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-400 text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-500">
                  <CalendarDays size={16} /> Data
                </label>
                <input
                  type="date"
                  placeholder="Selecione a data"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-400 text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-500">
                  <Clock3 size={16} /> Turno
                </label>
                <select
                  value={turno}
                  onChange={(e) => setTurno(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-400 text-gray-700 placeholder-gray-400"
                >
                  <option value="matutino">Matutino</option>
                  <option value="vespertino">Vespertino</option>
                  <option value="noturno">Noturno</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block text-gray-500">Aula número</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  placeholder="1"
                  value={lessonNumber}
                  onChange={(e) => setLessonNumber(Number(e.target.value))}
                  className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-400 text-gray-700 placeholder-gray-400"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1 text-gray-500">
                  <FileText size={16} /> Observação
                </label>
                <textarea
                  placeholder="Ex: Solicitar projetor"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  rows={3}
                  className="w-full border rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-gray-400 text-gray-700 placeholder-gray-400"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition shadow-lg"
              >
                <Check size={18} /> {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Confirmar Reserva"}
              </button>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
            <h3 className="text-xl font-bold mb-2 text-gray-800">Reservas existentes</h3>
            <p className="text-gray-500 mb-4">Visualize, edite ou exclua reservas cadastradas.</p>
            {reservations.length === 0 ? (
              <p className="text-gray-500">Nenhuma reserva cadastrada.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {reservations.map((r) => {
                  const room = rooms.find((room) => room.id === r.sala_id);
                  return (
                    <li
                      key={r.id}
                      className="flex flex-col justify-between bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          Sala: {room ? `${room.nome_numero} - ${room.bloco}` : r.sala_id}
                        </p>
                        <p className="text-sm text-gray-500">
                          {r.motivo} | {r.data.slice(0, 10)} | {r.turno} | Aula {r.aula_numero}
                        </p>
                      </div>
                      <div className="flex justify-end gap-3 mt-3">
                        <button
                          className="flex items-center gap-1 text-yellow-600 hover:text-yellow-800 font-semibold"
                          onClick={() => handleEdit(r)}
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
                          onClick={() => handleDelete(r.id)}
                        >
                          <X size={16} /> Excluir
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

        </div>
      </div>
    </>
  );
}