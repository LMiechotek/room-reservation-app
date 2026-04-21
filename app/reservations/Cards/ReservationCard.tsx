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
  Edit,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ConfirmModal from "@/app/components/ui/ConfirmModal";

type Reservation = {
  id: string;
  bloco: string;
  nome_numero: string;
  usuario_nome: string;
  usuario_id: string;
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
  isAdmin?: boolean;
};

export default function ReservationCard({ reservation, isAdmin }: Props) {
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
  const router = useRouter();

  const statusStyles = {
    ativa: "bg-green-500 text-white",
    aberta: "bg-blue-500 text-white",
    concluida: "bg-gray-400 text-white",
    cancelada: "bg-red-500 text-white",
  };

  const statusColor =
    statusStyles[status as keyof typeof statusStyles] || "bg-gray-500 text-white";

  const formattedDate = data.slice(0, 10).split("-").reverse().join("/");
  const formattedStartHour = hora_inicio?.slice(0, 5);
  const formattedEndHour = hora_fim?.slice(0, 5);

  const showCreatedBy =
    criado_por_nome &&
    criado_por_nome.trim() !== "" &&
    criado_por_nome !== usuario_nome;

  const handleCancel = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/reservations/${id}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ cancelado_por: reservation.usuario_id }),
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
    <>
      <ConfirmModal
        open={showModal}
        title="Cancelar reserva"
        description={`Deseja realmente cancelar a reserva da disciplina ${disciplina}?`}
        confirmText={loading ? "Cancelando..." : "Sim, cancelar"}
        cancelText="Não"
        onCancel={() => setShowModal(false)}
        onConfirm={handleCancel}
      />
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
          <div className="mt-4 flex gap-2 justify-end">
            {isAdmin && (
              <button
                onClick={() => router.push(`/reservations/${id}/edit`)}
                className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors duration-200"
              >
                <Edit size={14} />
                Editar
              </button>
            )}
            <button
              onClick={() => setShowModal(true)}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors duration-200 disabled:bg-gray-400"
            >
              {loading ? "Cancelando..." : "Cancelar"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}