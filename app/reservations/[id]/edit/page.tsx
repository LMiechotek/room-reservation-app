"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, BookOpen, CalendarDays, Clock3, User, ChevronDown, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

type Room = {
  id: string;
  nome_numero: string;
  bloco: string;
};

type SlotInfo = {
  hora_inicio: string;
  hora_fim: string;
};

type HorariosResponse = Record<string, Record<string, SlotInfo>>;

type ExistingReservation = {
  sala_id: string;
  data: string;
  turno: string;
  aula_numero: number;
  status: string;
  id: string;
};

export default function EditReservationPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { user } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [horarios, setHorarios] = useState<HorariosResponse>({});
  const [takenSlots, setTakenSlots] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [salaId, setSalaId] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [date, setDate] = useState("");
  const [turno, setTurno] = useState("matutino");
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  // Redirect non-admins
  useEffect(() => {
    if (user && user.tipo !== "admin_cpd") {
      router.replace("/reservations");
    }
  }, [user, router]);

  // Load reservation + rooms + horarios in parallel
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const [reservationRes, roomsRes, horariosRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${id}`, { credentials: "include" }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/salas`, { credentials: "include" }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas/horarios`, { credentials: "include" }),
        ]);

        if (!reservationRes.ok) {
          toast.error("Reserva não encontrada.");
          router.replace("/reservations");
          return;
        }

        const [reservation, roomsData, horariosData] = await Promise.all([
          reservationRes.json(),
          roomsRes.json(),
          horariosRes.json(),
        ]);

        setSalaId(reservation.sala_id);
        setDisciplina(reservation.disciplina || "");
        setDate(reservation.data.slice(0, 10));
        setTurno(reservation.turno);
        setSelectedLesson(reservation.aula_numero);
        setRooms(roomsData);
        setHorarios(horariosData);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar reserva.");
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [id, router]);

  // Recompute taken slots when date/turno/sala changes
  useEffect(() => {
    setTakenSlots([]);
    if (!date || !salaId) return;

    const fetchTaken = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reservas`, { credentials: "include" });
        if (!res.ok) return;
        const data: ExistingReservation[] = await res.json();

        const taken = data
          .filter(
            (r) =>
              r.sala_id === salaId &&
              r.data.slice(0, 10) === date &&
              r.turno === turno &&
              (r.status === "ativa" || r.status === "aberta") &&
              r.id !== id
          )
          .map((r) => r.aula_numero);

        setTakenSlots(taken);
        // If current selection became taken, clear it
        setSelectedLesson((prev) => (prev !== null && taken.includes(prev) ? null : prev));
      } catch (error) {
        console.error(error);
      }
    };

    fetchTaken();
  }, [date, turno, salaId, id]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSlots = horarios[turno]
    ? Object.entries(horarios[turno]).map(([num, info]) => ({
        numero: Number(num),
        horario: `${info.hora_inicio}-${info.hora_fim}`,
      }))
    : [];

  const selectedSlot = currentSlots.find((s) => s.numero === selectedLesson);

  const handleSubmit = async () => {
    if (!salaId || !disciplina.trim() || !date || !selectedLesson) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    if (date < today) {
      toast.warning("Não é possível reservar em datas passadas.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Salvando alterações...", { autoClose: 1000 });

      const payload = {
        sala_id: salaId,
        data: date,
        turno,
        aula_numero: selectedLesson,
        disciplina,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result?.message || "Erro ao atualizar reserva.");
        return;
      }

      toast.success("Reserva atualizada com sucesso!");
      router.push("/reservations");
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao atualizar reserva.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-blue-800 via-teal-400 to-teal-500">
        <p className="text-white text-lg font-medium">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-blue-800 via-teal-400 to-teal-500 p-4 sm:p-6 pt-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => router.push("/reservations")}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow hover:shadow-md transition"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2 rounded-xl transition font-semibold"
          >
            <Save size={18} />
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          <div className="flex justify-center mb-5">
            <Image
              src="/images/unespar.png"
              alt="Logo UNESPAR"
              width={110}
              height={110}
              className="w-24 h-auto object-contain"
              priority
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] text-center mb-1">
            Editar Reserva
          </h1>
          <p className="text-gray-500 text-center text-sm mb-6">
            Altere os dados da reserva abaixo.
          </p>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <User size={16} />
                Sala
              </label>
              <select
                value={salaId}
                onChange={(e) => setSalaId(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>Selecione uma sala</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.nome_numero} — {room.bloco}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <BookOpen size={16} />
                Disciplina
              </label>
              <input
                type="text"
                value={disciplina}
                onChange={(e) => setDisciplina(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <CalendarDays size={16} />
                Data
              </label>
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Clock3 size={16} />
                Turno
              </label>
              <select
                value={turno}
                onChange={(e) => {
                  setTurno(e.target.value);
                  setSelectedLesson(null);
                }}
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="matutino">Matutino</option>
                <option value="vespertino">Vespertino</option>
                <option value="noturno">Noturno</option>
              </select>
            </div>

            <div ref={dropdownRef}>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Clock3 size={16} />
                Horário
              </label>
              <div
                className="w-full border rounded-xl px-3 py-3 min-h-[48px] flex items-center cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {selectedSlot ? (
                  <span className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {selectedSlot.horario}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLesson(null);
                      }}
                      className="hover:text-blue-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm select-none">
                    Selecione um horário...
                  </span>
                )}
                <ChevronDown
                  size={16}
                  className={`ml-auto text-gray-400 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {dropdownOpen && currentSlots.length > 0 && (
                <div className="border border-gray-200 rounded-xl mt-1 shadow-lg bg-white overflow-hidden relative z-10">
                  {currentSlots.map((slot) => {
                    const isSelected = selectedLesson === slot.numero;
                    const isTaken = takenSlots.includes(slot.numero);
                    return (
                      <div
                        key={slot.numero}
                        onClick={() => {
                          if (isTaken) return;
                          setSelectedLesson(slot.numero);
                          setDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-4 py-2 text-sm transition-colors
                          ${isTaken
                            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-blue-50 text-blue-700 font-medium cursor-pointer hover:bg-blue-100"
                            : "text-gray-700 cursor-pointer hover:bg-blue-50"
                          }`}
                      >
                        <span>{slot.horario}</span>
                        {isTaken && <span className="text-xs text-red-400 font-medium">Ocupado</span>}
                        {isSelected && !isTaken && <span className="text-blue-600 font-bold">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
