"use client";

import { useEffect, useState } from "react";
import ReservationCard from "./Cards/ReservationCard";

type Reservation = {
  id: string;
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

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] =
    useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`
      );
      const data = await response.json();

      const userType = localStorage.getItem("userType");
      const userId = localStorage.getItem("userId");

      const visibleReservations =
        userType === "admin_cpd"
          ? data
          : data.filter(
              (reservation: any) => reservation.usuario_id === userId
            );
      const formatted = visibleReservations.map((reservation: any) => ({
        id: reservation.id,
        bloco: reservation.bloco,
        nome_numero: reservation.nome_numero,
        usuario_nome: reservation.usuario_nome,
        data: reservation.data.slice(0, 10),
        hora_inicio: reservation.hora_inicio,
        hora_fim: reservation.hora_fim,
        turno: reservation.turno,
        aula_numero: reservation.aula_numero,
        motivo: reservation.motivo,
        status: reservation.status,
      }));

      setReservations(formatted);
      setFilteredReservations(formatted);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
    }
  };

  const handleSearch = () => {
    const filtered = reservations.filter((reservation) => {
      const matchSearch =
        reservation.nome_numero.toLowerCase().includes(search.toLowerCase()) ||
        reservation.usuario_nome.toLowerCase().includes(search.toLowerCase());

      const matchDate = date ? reservation.data === date : true;

      return matchSearch && matchDate;
    });

    setFilteredReservations(filtered);
  };

  return (
    <div className="w-full min-h-screen">
      <div className="relative w-full flex flex-col items-center justify-center px-4 md:px-16 pt-24 pb-10">
        <div className="absolute inset-0 bg-linear-to-r from-blue-800 via-teal-400 to-teal-500"></div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-6">
            Reservas
          </h1>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder={
                localStorage.getItem("userType") === "admin_cpd"
                  ? "Buscar sala ou professor..."
                  : "Buscar sala..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg outline-none bg-white"
            />

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-4 py-2 rounded-lg outline-none bg-white"
            />

            <button
              onClick={handleSearch}
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-xl transition"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-10 px-4 md:px-0">
        {filteredReservations.length > 0 ? (
          filteredReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation} 
            />
          ))
        ) : (
          <p className="text-center col-span-full text-gray-700">
            Nenhuma reserva encontrada.
          </p>
        )}
      </div>
    </div>
  );
}