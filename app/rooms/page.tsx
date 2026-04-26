"use client";

import React, { useEffect, useState } from "react";
import { LayoutGrid, GraduationCap, Laptop } from "lucide-react";
import RoomCard from "./Cards/RoomCard";
import ReservationModal from "./Modal/ReservationModal";
import CreateRoomModal from "./Modal/CreateRoomModal";
import { toast } from "react-toastify";

type Room = {
  id: string;
  name: string;
  capacity: number;
  roomType: "sala_aula" | "laboratorio";
  status: "disponivel" | "reservada";
};

type Reservation = {
  sala_id: string;
  status: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
};

type RoomFilter = "todos" | "sala_aula" | "laboratorio";

export default function Rooms() {
  const today = new Date().toISOString().slice(0, 10);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [horarios, setHorarios] = useState<any>(null);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(today);
  const [time] = useState(""); 
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("todos");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });

        if (!response.ok) {
          setIsLoggedIn(false);
          setIsAdmin(false);
          return;
        }

        const data = await response.json();
        setIsAdmin(data.tipo === "admin_cpd");
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        const res = await fetch("/api/reservations/schedules");
        const data = await res.json();
        setHorarios(data);
      } catch {
        toast.error("Erro ao carregar horários.");
      }
    };

    fetchHorarios();
  }, []);

  const generateSlots = () => {
    if (!horarios) return [];

    const slots: any[] = [];

    Object.entries(horarios).forEach(([turno, aulas]: any) => {
      Object.entries(aulas).forEach(([numero, horario]: any) => {
        slots.push({
          key: `${turno}-${numero}`,
          start: horario.hora_inicio.slice(0, 5),
          end: horario.hora_fim.slice(0, 5),
        });
      });
    });

    return slots;
  };

  // 🔧 reserva → slots
  const getReservationSlots = (reservation: Reservation, slots: any[]) => {
    const start = reservation.hora_inicio.slice(0, 5);
    const end = reservation.hora_fim.slice(0, 5);

    return slots
      .filter((slot) => slot.start >= start && slot.end <= end)
      .map((slot) => slot.key);
  };

  const getValidSlots = (slots: any[], selectedDate: string) => {
    const now = new Date();
    const todayStr = new Date().toISOString().slice(0, 10);

    return slots.filter((slot) => {
      if (selectedDate !== todayStr) return true;

      const [h, m] = slot.start.split(":").map(Number);
      const slotDate = new Date();
      slotDate.setHours(h, m, 0, 0);

      return slotDate > now;
    });
  };

  const fetchRoomsData = async () => {
    try {
      const [roomsResponse, reservationsResponse] = await Promise.all([
        fetch("/api/rooms", { credentials: "include" }),
        fetch("/api/reservations", { credentials: "include" }),
      ]);

      const roomsData = await roomsResponse.json();
      const reservationsData = await reservationsResponse.json();

      setReservations(reservationsData);

      const slots = generateSlots();

      const formattedRooms: Room[] = roomsData
        .filter((room: any) => room.ativo === true)
        .map((room: any) => {
          const reservasDaSala = reservationsData.filter(
            (r: Reservation) =>
              r.sala_id === room.id &&
              r.status === "ativa" &&
              r.data.slice(0, 10) === date
          );

          const occupiedSlots = reservasDaSala.flatMap((r: Reservation) =>
            getReservationSlots(r, slots)
          );

          const validSlots = getValidSlots(slots, date);

          const isFullyBooked =
            validSlots.length > 0 &&
            validSlots.every((slot) => occupiedSlots.includes(slot.key));

          return {
            id: room.id,
            name: `${room.nome_numero} - ${room.bloco}`,
            capacity: room.capacidade,
            roomType: room.tipo_sala,
            status: isFullyBooked ? "reservada" : "disponivel",
          };
        });

      setRooms(formattedRooms);
      setAllRooms(formattedRooms);
    } catch (error) {
      console.error("Erro ao buscar salas:", error);
      toast.error("Erro ao carregar salas.");
    }
  };

  useEffect(() => {
    if (horarios) {
      fetchRoomsData();
    }
  }, [horarios, date]);

  const handleReserve = (roomId: string) => {
    if (!isLoggedIn) {
      toast.info("Você precisa estar logado para fazer uma reserva.");
      return;
    }
    setSelectedRoomId(roomId);
  };

  const handleSearch = () => {
    const searchDate = date || new Date().toISOString().slice(0, 10);

    const filteredRooms: Room[] = allRooms
      .map((room) => {
        const roomReservations = reservations.filter(
          (reservation) =>
            reservation.sala_id === room.id &&
            reservation.status === "ativa" &&
            reservation.data.slice(0, 10) === searchDate
        );

        const hasConflict = roomReservations.some((reservation) => {
          if (!time) return false;

          return (
            time >= reservation.hora_inicio.slice(0, 5) &&
            time <= reservation.hora_fim.slice(0, 5)
          );
        });

        return {
          ...room,
          status: (hasConflict ? "reservada" : room.status) as Room["status"],
        };
      })
      .filter((room) =>
        room.name.toLowerCase().includes(search.toLowerCase())
      )
      .filter((room) =>
        roomFilter === "todos" ? true : room.roomType === roomFilter
      );

    setRooms(filteredRooms);

    if (filteredRooms.length === 0) {
      toast.info("Nenhuma sala encontrada para os filtros selecionados.");
    }
  };

  const filteredRooms = rooms.filter((room) =>
    roomFilter === "todos" ? true : room.roomType === roomFilter
  );
  return (
    <>


      <div className="w-full min-h-screen">
        <div className="relative w-full flex flex-col items-center justify-center overflow-visible px-4 md:px-16 pt-24 pb-10 md:pt-28 md:pb-12">
          <div className="absolute inset-0 bg-linear-to-r from-blue-800 via-teal-400 to-teal-500"></div>

          <div className="relative z-10 w-full max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mb-6">
              Salas Disponíveis
            </h1>

            <div className="bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-xl flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4 items-center w-full">
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

              <button
                onClick={handleSearch}
                className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-xl transition text-sm md:text-base"
              >
                Buscar
              </button>

              {isAdmin && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition text-sm md:text-base"
                >
                  Nova sala +
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white py-16 px-4 md:px-16 -mt-12 rounded-t-3xl shadow-lg">
          <div className="flex justify-center mb-10">
            <div className="inline-flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200">
              <button
                onClick={() => setRoomFilter("todos")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${roomFilter === "todos"
                    ? "bg-white text-blue-700 shadow-md scale-105"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <LayoutGrid size={16} />
                Todos
              </button>

              <button
                onClick={() => setRoomFilter("sala_aula")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${roomFilter === "sala_aula"
                    ? "bg-white text-blue-700 shadow-md scale-105"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <GraduationCap size={16} />
                Sala de Aula
              </button>

              <button
                onClick={() => setRoomFilter("laboratorio")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${roomFilter === "laboratorio"
                    ? "bg-white text-blue-700 shadow-md scale-105"
                    : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <Laptop size={16} />
                Laboratório
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                name={room.name}
                capacity={room.capacity}
                roomType={room.roomType}
                status={room.status}
                onReserve={handleReserve}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>

        {selectedRoomId && (
          <ReservationModal
            roomId={selectedRoomId}
            onClose={() => setSelectedRoomId(null)}
            onCreated={fetchRoomsData}
          />
        )}

        {showCreateModal && (
          <CreateRoomModal
            onClose={() => setShowCreateModal(false)}
            onCreated={fetchRoomsData}
          />
        )}
      </div>
    </>
  );
}