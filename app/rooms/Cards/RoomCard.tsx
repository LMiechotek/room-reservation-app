"use client";

import React from "react";
import { Users, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

type RoomProps = {
  id: string;
  name: string;
  capacity: number;
  roomType: "sala_aula" | "laboratorio";
  status: "disponivel" | "ocupada" | "reservada";
  onReserve: (roomId: string) => void;
  isLoggedIn: boolean;
};

export default function RoomCard({
  id,
  name,
  capacity,
  roomType,
  status,
  onReserve,
  isLoggedIn,
}: RoomProps) {
  const router = useRouter();

  const statusStyles = {
    disponivel: "bg-green-500 text-white",
    ocupada: "bg-red-500 text-white",
    reservada: "bg-yellow-500 text-white",
  };

  const statusLabel = {
    disponivel: "Disponível",
    ocupada: "Ocupada",
    reservada: "Reservada",
  };

  const handleViewDetails = () => {
    router.push(`/rooms/${id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-transform ease-in-out duration-300 cursor-pointer flex flex-col justify-between">

      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-black">{name}</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
          {statusLabel[status]}
        </span>
      </div>
      <div className="space-y-3 text-black">
        <p className="flex items-center gap-2">
          <Users size={18} className="text-green-600" />
          <strong>Capacidade:</strong> {capacity} pessoas
        </p>
        <p className="flex items-center gap-2">
          <Building2 size={18} className="text-blue-600" />
          <strong>Tipo de sala:</strong> {roomType === "laboratorio" ? "Laboratório" : "Sala de Aula"}
        </p>
      </div>
      <div
        className={`flex gap-3 mt-6 ${status !== "disponivel" || !isLoggedIn ? "justify-center" : ""
          }`}
      >
        {isLoggedIn && status === "disponivel" && (
          <button
            onClick={() => onReserve(id)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition w-1/2"
          >
            Reservar
          </button>
        )}

        <button
          onClick={handleViewDetails}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition ${status !== "disponivel" || !isLoggedIn
              ? "w-1/2 text-center"
              : "w-1/2"
            }`}
        >
          Ver detalhes
        </button>
      </div>
    </div>
  );
}