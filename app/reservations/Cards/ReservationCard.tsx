"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock3,
  BookOpen,
  Building2,
  BadgeInfo,
  User,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

type Reservation = {
  id: string;
  bloco: string;
  nome_numero: string;
  usuario_nome: string;
  criado_por_nome?: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  turno: string;
  aula_numero: number;
  disciplina: string;
  status: string;
};

type Props = {
  reservation: Reservation;
};

export default function ReservationCard({ reservation }: Props) {
  const {
    id,
    bloco,
    nome_numero,
    usuario_nome,
    criado_por_nome,
    data,
    hora_inicio,
    hora_fim,
    turno,
    aula_numero,
    disciplina,
    status: initialStatus,
  } = reservation;

  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const statusStyles = {
    ativa: "bg-green-500 text-white",
    aberta: "bg-blue-500 text-white",
    concluida: "bg-gray-400 text-white",
    cancelada: "bg-red-500 text-white",
  };

  const statusColor =
    statusStyles[status as keyof typeof statusStyles] || "bg-gray-500 text-white";

  const formattedDate = new Date(data).toLocaleDateString("pt-BR");
  const formattedStartHour = hora_inicio?.slice(0, 5);
  const formattedEndHour = hora_fim?.slice(0, 5);

  const showCreatedBy =
    criado_por_nome &&
    criado_por_nome.trim() !== "" &&
    criado_por_nome !== usuario_nome;

  const handleCancel = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Usuário não autenticado");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${id}/cancelar`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cancelado_por: reservation.usuario_nome }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Falha ao cancelar a reserva");
      }

      setStatus("cancelada");
      toast.success("Reserva cancelada com sucesso!");
    } catch (error: any) {
      console.error(error);
      toast.error(`Erro ao cancelar: ${error.message}`);
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition duration-300 relative">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{nome_numero}</h2>
          <p className="text-sm text-gray-500">{bloco}</p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColor}`}
        >
          {status}
        </span>
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <BookOpen size={16} className="text-blue-500" />
          <span className="font-medium">{usuario_nome}</span>
        </div>

        {showCreatedBy && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 ml-6">
            <User size={14} />
            <span>Reserva criada por {criado_por_nome}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">
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
          <span>{aula_numero}ª aula</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-700">
        {disciplina}
      </div>

      {status === "ativa" && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors duration-200 disabled:bg-gray-400"
          >
            {loading ? "Cancelando..." : "Cancelar"}
          </button>
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirmar cancelamento</h3>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>
            <p className="mb-6">Deseja realmente cancelar a reserva {nome_numero}?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300"
              >
                Não
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Sim, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}