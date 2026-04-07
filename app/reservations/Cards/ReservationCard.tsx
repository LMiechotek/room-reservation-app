"use client";

import {
  CalendarDays,
  Clock3,
  BookOpen,
  Building2,
  BadgeInfo,
  User,
} from "lucide-react";

type Reservation = {
  bloco: string;
  nome_numero: string;
  usuario_nome: string;
  criado_por_nome?: string;
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
    criado_por_nome,
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
    statusStyles[status as keyof typeof statusStyles] ||
    "bg-gray-500 text-white";

  const formattedDate = new Date(data).toLocaleDateString("pt-BR");
  const formattedStartHour = hora_inicio?.slice(0, 5);
  const formattedEndHour = hora_fim?.slice(0, 5);

  const isCreatedByAdmin =
    criado_por_nome && criado_por_nome !== usuario_nome;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {bloco} - {nome_numero}
          </h2>
          <p className="text-sm text-gray-500">
            Professor: {usuario_nome}
          </p>

          {isCreatedByAdmin && (
            <p className="text-xs text-blue-600 mt-1">
              Criado por: {criado_por_nome}
            </p>
          )}
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColor}`}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-green-500" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock3 size={16} className="text-yellow-500" />
          <span>
            {formattedStartHour} às {formattedEndHour}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-purple-500" />
          <span className="capitalize">{turno}</span>
        </div>

        <div className="flex items-center gap-2">
          <BadgeInfo size={16} className="text-pink-500" />
          <span>
            {aula_numero} {aula_numero > 1 ? "aulas" : "aula"}
          </span>
        </div>

        <div className="flex items-center gap-2 col-span-2 pt-2 border-t border-gray-100">
          <BookOpen size={16} className="text-blue-500" />
          <p className="text-sm text-gray-700">
            <span className="font-medium text-gray-800">Disciplina:</span>{" "}
            {motivo}
          </p>
        </div>
      </div>
    </div>
  );
}