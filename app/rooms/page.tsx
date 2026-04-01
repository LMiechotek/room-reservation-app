"use client";

import React, { useEffect, useState } from "react";
import RoomCard from "./Cards/RoomCard";
import ReservationModal from "./Modal/ReservationModal";

type Room = {
  id: string;
  name: string;
  capacity: number;
  status: "disponivel" | "ocupada" | "reservada";
};

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    setIsAdmin(userType === "admin_cpd");
  }, []);

  const handleReserve = (roomName: string) => {
    const userType = localStorage.getItem("userType");

    if (!userType) {
      alert("Você precisa estar logado para fazer uma reserva.");
      return;
    }

    setSelectedRoom(roomName);
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/salas?tipo_sala=sala_aula`
        );

        const data = await response.json();

        const formattedRooms = data.map((room: any) => ({
          id: room.id,
          name: `${room.nome_numero} - ${room.bloco}`,
          capacity: room.capacidade,
          status: room.ativo ? "disponivel" : "ocupada",
        }));

        setRooms(formattedRooms);
      } catch (error) {
        console.error("Erro ao buscar salas:", error);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="w-full min-h-screen">
      <div className="relative h-[50vh] w-full flex items-center justify-center overflow-hidden px-4 md:px-16">
        <div className="absolute inset-0 bg-linear-to-r from-blue-800 via-teal-400 to-teal-500"></div>

        <div className="relative z-10 w-full max-w-4xl mx-auto pt-24">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-6">
            Salas Disponíveis
          </h1>

          <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-xl flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar sala..."
              className="flex-1 px-4 py-2 rounded-lg outline-none bg-white"
            />

            <input
              type="date"
              className="px-4 py-2 rounded-lg outline-none bg-white"
            />

            <input
              type="time"
              className="px-4 py-2 rounded-lg outline-none bg-white"
            />

            <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition">
              Buscar
            </button>

            {isAdmin && (
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition">
                Nova sala +
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white py-16 px-4 md:px-16 -mt-12 rounded-t-3xl shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              name={room.name}
              capacity={room.capacity}
              status={room.status}
              onReserve={handleReserve}
            />
          ))}
        </div>
      </div>

      {selectedRoom && (
        <ReservationModal
          roomName={selectedRoom}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
}