"use client";

import { useState } from "react";
import { User, BookOpen, CalendarDays, Clock3, FileText } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Image from "next/image";
import "react-toastify/dist/ReactToastify.css";

type Props = {
  roomId: string;
  onClose: () => void;
};

export default function ReservationModal({ roomId, onClose }: Props) {
  const [responsibleName, setResponsibleName] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [turno, setTurno] = useState("matutino");
  const [lessonNumber, setLessonNumber] = useState(1);
  const [observation, setObservation] = useState("");

  const handleSubmit = async () => {
    if (!responsibleName || !subject || !date) {
      toast.warning("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const usuarioId = localStorage.getItem("userId");
      if (!usuarioId) {
        toast.error("Usuário não encontrado.");
        return;
      }

      const payload = {
        sala_id: roomId,
        usuario_id: usuarioId,
        criado_por: usuarioId,
        data: date,
        turno,
        aula_numero: lessonNumber,
        motivo: `${subject} - ${responsibleName}${
          observation ? " - " + observation : ""
        }`,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Erro ao reservar sala");

      toast.success("Reserva realizada com sucesso!");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao realizar reserva");
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      <ToastContainer />
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
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
                <User size={16} />
                Nome do responsável
              </label>
              <input
                type="text"
                value={responsibleName}
                onChange={(e) => setResponsibleName(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-black">
                <FileText size={16} />
                Observação
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-semibold"
            >
              Confirmar
            </button>
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}