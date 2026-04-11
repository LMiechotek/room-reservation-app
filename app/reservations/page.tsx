"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ReservationCard from "./Cards/ReservationCard";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

type Reservation = {
  id: string;
  bloco: string;
  nome_numero: string;
  usuario_nome: string;
  usuario_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  turno: string;
  aula_numero: number;
  disciplina: string;
  status: string;
};


const isActive = (status: string) => status === "ativa" || status === "aberta";
const isCancelled = (status: string) =>
  status === "cancelada" || status === "cancelado";

const statusPriority = (status: string): number => {
  if (isActive(status)) return 0;
  if (isCancelled(status)) return 2;
  return 1; // concluida or any other status
};

const sortReservations = (list: Reservation[]): Reservation[] =>
  [...list].sort((a, b) => {
    const pa = statusPriority(a.status);
    const pb = statusPriority(b.status);

    if (pa !== pb) return pa - pb;

    // Same group: sort by date — cancelled recent-first, rest closest-first
    if (isCancelled(a.status)) return b.data.localeCompare(a.data);
    return a.data.localeCompare(b.data);
  });

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todas" | "ativa" | "cancelada">("todas");

  useEffect(() => {
    if (user) fetchReservations();
  }, [user]);

  const fetchReservations = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Falha ao buscar reservas");

      const data = await response.json();

      const visibleReservations =
        user.tipo === "admin_cpd"
          ? data
          : data.filter((reservation: any) => reservation.usuario_id === user.id);

      const formatted: Reservation[] = visibleReservations.map((reservation: any) => ({
        id: reservation.id,
        bloco: reservation.bloco,
        nome_numero: reservation.nome_numero,
        usuario_nome: reservation.usuario_nome,
        usuario_id: reservation.usuario_id,
        data: reservation.data.slice(0, 10),
        hora_inicio: reservation.hora_inicio,
        hora_fim: reservation.hora_fim,
        turno: reservation.turno,
        aula_numero: reservation.aula_numero,
        disciplina: reservation.disciplina || "—",
        status: reservation.status,
      }));

      setReservations(formatted);
      setFilteredReservations(formatted);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
    }
  };

  const handleSearch = () => {
    if (!user) return;

    const filtered = reservations.filter((reservation) => {
      const matchSearch =
        reservation.nome_numero.toLowerCase().includes(search.toLowerCase()) ||
        (user.tipo === "admin_cpd" &&
          reservation.usuario_nome.toLowerCase().includes(search.toLowerCase()));

      const matchDate = date ? reservation.data === date : true;

      return matchSearch && matchDate;
    });

    setFilteredReservations(filtered);
  };

  const displayedReservations = (() => {
    const filtered = filteredReservations.filter((r) => {
      if (statusFilter === "todas") return true;
      if (statusFilter === "cancelada") return isCancelled(r.status);
      return isActive(r.status);
    });
    return statusFilter === "todas" ? sortReservations(filtered) : filtered;
  })();

  const statusCounts = {
    todas: filteredReservations.length,
    ativa: filteredReservations.filter((r) => isActive(r.status)).length,
    cancelada: filteredReservations.filter((r) => isCancelled(r.status)).length,
  };

  const placeholder =
    user?.tipo === "admin_cpd"
      ? "Buscar sala ou professor..."
      : "Buscar sala...";

  return (
    <>
      <div className="w-full min-h-screen">
        <div className="relative w-full flex flex-col items-center justify-center px-4 md:px-16 pt-24 pb-10">
          <div className="absolute inset-0 bg-linear-to-r from-blue-800 via-teal-400 to-teal-500"></div>

          <div className="relative z-10 w-full max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-white text-center mb-6">
              Reservas
            </h1>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl flex flex-col gap-3">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder={placeholder}
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

                <Link
                  href="/admin/reservation"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl transition text-center"
                >
                  Nova reserva
                </Link>
              </div>

              <div className="flex items-center gap-2">
                {(
                  [
                    { key: "todas", label: "Todas", count: statusCounts.todas },
                    { key: "ativa", label: "Ativas", count: statusCounts.ativa },
                    { key: "cancelada", label: "Canceladas", count: statusCounts.cancelada },
                  ] as const
                ).map(({ key, label, count }) => {
                  const isActive = statusFilter === key;
                  const colorMap = {
                    todas: isActive
                      ? "bg-white text-blue-800 shadow-md"
                      : "text-white hover:bg-white/20",
                    ativa: isActive
                      ? "bg-green-500 text-white shadow-md"
                      : "text-white hover:bg-green-500/30",
                    cancelada: isActive
                      ? "bg-red-500 text-white shadow-md"
                      : "text-white hover:bg-red-500/30",
                  };
                  return (
                    <button
                      key={key}
                      onClick={() => setStatusFilter(key)}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${colorMap[key]}`}
                    >
                      {label}
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                          isActive ? "bg-white/25" : "bg-white/15"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-10 px-4 md:px-0">
          {displayedReservations.length > 0 ? (
            displayedReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                isAdmin={user?.tipo === "admin_cpd"}
              />
            ))
          ) : (
            <p className="text-center col-span-full text-gray-700">
              Nenhuma reserva encontrada.
            </p>
          )}
        </div>
      </div>
    </>
  );
}