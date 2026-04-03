"use client";

import { useState } from "react";
import { User, BookOpen, CalendarDays, Clock3, FileText } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

type Props = {
  roomName: string;
  onClose: () => void;
};

export default function ReservationModal({ roomName, onClose }: Props) {
  const [responsibleName, setResponsibleName] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [observation, setObservation] = useState("");

  const handleSubmit = () => {
    if (!responsibleName || !subject || !date || !startTime) {
      toast.warning("Preencha todos os campos obrigatórios!");
      return;
    }

    console.log({
      roomName,
      responsibleName,
      subject,
      date,
      startTime,
      observation,
    });

    toast.success("Reserva realizada com sucesso!");
    onClose();
  };
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <ToastContainer />
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
        onClick={handleBackgroundClick} // <-- captura o clique no fundo
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
          <h2 className="text-2xl font-bold text-[#000000] mb-6 text-center">
            Reservar {roomName}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#000000] mb-2">
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
              <label className="flex items-center gap-2 text-sm font-medium text-[#000000] mb-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#000000] mb-2">
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
                <label className="flex items-center gap-2 text-sm font-medium text-[#000000] mb-2">
                  <Clock3 size={16} />
                  Hora de início
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[#000000] mb-2">
                <FileText size={16} />
                Observação (opcional)
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 resize-none outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition"
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
      </div>
    </>
  );
}