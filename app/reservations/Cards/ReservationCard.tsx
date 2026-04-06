"use client";

import {
  CalendarDays,
  Clock3,
  BookOpen,
  Building2,
  BadgeInfo,
} from "lucide-react";

type Reservation = {
  bloco: string;
  nome_numero: string;
  usuario_nome: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  turno: string;
  aula_numero: number;
  motivo: string;
  status: string;
};

type Props = {
  reservation: Reservation;
};

export default function ReservationCard({ reservation }: Props) {
  const {
    bloco,
    nome_numero,
    usuario_nome,
    data,
    hora_inicio,
    hora_fim,
    turno,
    aula_numero,
    motivo,
    status,
  } = reservation;

  const statusStyles = {
    ativa: "bg-green-500 text-white",
    aberta: "bg-blue-500 text-white",
    concluida: "bg-gray-400 text-white",
    cancelada: "bg-red-500 text-white",
  };

  const statusColor =
    statusStyles[status as keyof typeof statusStyles] || "bg-gray-500 text-white";

  const formattedDate = new Date(data).toLocaleDateString("pt-BR");
  const formattedStartHour = hora_inicio.slice(0, 5);
  const formattedEndHour = hora_fim.slice(0, 5);

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition-transform transform hover:scale-105 ease-in-out duration-300">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-gray-900">{`${bloco} - ${nome_numero}`}</h2>
        <span
          className={`px-4 py-1 rounded-full text-sm font-semibold uppercase ${statusColor}`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-3 text-gray-800">
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
          <BookOpen size={20} className="text-blue-500" />
          <span className="font-medium">
            Professor: <span className="font-normal">{usuario_nome}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
          <CalendarDays size={20} className="text-green-500" />
          <span className="font-medium">
            Data & Horário:{" "}
            <span className="font-normal">
              {formattedDate} - {formattedStartHour} às {formattedEndHour}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
          <Clock3 size={20} className="text-yellow-500" />
          <span className="font-medium">
            Turno: <span className="font-normal">{turno}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
          <Building2 size={20} className="text-purple-500" />
          <span className="font-medium">
            Aula: <span className="font-normal">{aula_numero}</span>
          </span>
        </div>

        <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-2">
          <BadgeInfo size={20} className="mt-1 text-pink-500" />
          <span className="font-medium">
            Motivo: <span className="font-normal">{motivo}</span>
          </span>
        </div>
      </div>
    </div>
  );
}