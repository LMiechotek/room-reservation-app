"use client";

import React, { useEffect, useState } from "react";
import RoomCard from "./Cards/RoomCard";
import ReservationModal from "./Modal/ReservationModal";
import CreateRoomModal from "./Modal/CreateRoomModal";

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

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

  const handleSearch = () => {
    console.log("Buscar:", { search, date, time });
  };

  return (
    <div className="w-full min-h-screen">
      <div className="relative w-full flex flex-col items-center justify-center overflow-visible px-4 md:px-16 pt-24 pb-12 md:pt-32 md:pb-16 min-h-[60vh] md:min-h-[70vh]">
        <div className="absolute inset-0 bg-linear-to-r from-blue-800 via-teal-400 to-teal-500"></div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-6">
            Salas Disponíveis
          </h1>

          <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-xl flex flex-col sm:flex-col md:flex-row md:flex-wrap gap-3 md:gap-4 items-center w-full">
            <input
              type="text"
              placeholder="Buscar sala..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:flex-1 px-4 py-2 rounded-lg outline-none bg-white text-sm md:text-base"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full md:w-auto px-4 py-2 rounded-lg outline-none bg-white text-sm md:text-base"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full md:w-auto px-4 py-2 rounded-lg outline-none bg-white text-sm md:text-base"
            />
            <button
              onClick={handleSearch}
              className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition text-sm md:text-base"
            >
              Buscar
            </button>
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition text-sm md:text-base"
              >
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
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => window.location.reload()}
        />
      )}
    </div>
  );
}