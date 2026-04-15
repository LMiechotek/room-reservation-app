"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, BookOpen, CalendarDays, Clock3, Building2, ChevronDown, X, Check,} from "lucide-react";
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

type SchedulesResponse = Record<string, Record<string, SlotInfo>>;

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
  const reservationId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const router = useRouter();
  const { user } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [schedules, setSchedules] = useState<SchedulesResponse>({});
  const [takenSlots, setTakenSlots] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [roomId, setRoomId] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [shift, setShift] = useState("matutino");

  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user && user.tipo !== "admin_cpd") {
      router.replace("/reservations");
    }
  }, [user, router]);

  useEffect(() => {
    if (!reservationId) return;

    const loadData = async () => {
      try {
        const [reservationRes, roomsRes, schedulesRes] =
          await Promise.all([
            fetch(`/api/reservations/${reservationId}`, {
              credentials: "include",
            }),
            fetch(`/api/rooms`, {
              credentials: "include",
            }),
            fetch(`/api/reservations/schedules`, {
              credentials: "include",
            }),
          ]);

        if (!reservationRes.ok) {
          toast.error("Reserva não encontrada.");
          router.replace("/reservations");
          return;
        }

        const [reservation, roomsData, schedulesData] =
          await Promise.all([
            reservationRes.json(),
            roomsRes.json(),
            schedulesRes.json(),
          ]);

        setRoomId(reservation.sala_id);
        setSubject(reservation.disciplina || "");
        setDate(reservation.data.slice(0, 10));
        setShift(reservation.turno);
        setSelectedLessons([reservation.aula_numero]);

        setRooms(roomsData);
        setSchedules(schedulesData);
      } catch (error) {
        console.error(error);
        toast.error("Erro ao carregar reserva.");
      } finally {
        setFetching(false);
      }
    };

    loadData();
  }, [reservationId, router]);

  useEffect(() => {
    setTakenSlots([]);

    if (!date || !roomId) return;

    const fetchTakenSlots = async () => {
      try {
        const res = await fetch(`/api/reservations`, {
          credentials: "include",
        });

        if (!res.ok) return;

        const data: ExistingReservation[] = await res.json();

        const taken = data
          .filter(
            (reservation) =>
              reservation.sala_id === roomId &&
              reservation.data.slice(0, 10) === date &&
              reservation.turno === shift &&
              (reservation.status === "ativa" ||
                reservation.status === "aberta") &&
              reservation.id !== reservationId
          )
          .map((reservation) => reservation.aula_numero);

        setTakenSlots(taken);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTakenSlots();
  }, [date, shift, roomId, reservationId]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const currentSlots = useMemo(() => {
    if (!schedules[shift]) return [];

    return Object.entries(schedules[shift]).map(([number, info]) => ({
      number: Number(number),
      time: `${info.hora_inicio} - ${info.hora_fim}`,
    }));
  }, [schedules, shift]);

  const selectedSlots = currentSlots.filter((slot) =>
    selectedLessons.includes(slot.number)
  );

  const currentRoom = rooms.find((room) => room.id === roomId);

  const toggleLesson = (lessonNumber: number) => {
    const isOccupied = takenSlots.includes(lessonNumber);

    if (isOccupied) return;

    setSelectedLessons((prev) =>
      prev.includes(lessonNumber)
        ? prev.filter((lesson) => lesson !== lessonNumber)
        : [...prev, lessonNumber].sort((a, b) => a - b)
    );
  };

  const handleSubmit = async () => {
    if (!roomId || !subject.trim() || !date || selectedLessons.length === 0) {
      toast.warning("Preencha todos os campos.");
      return;
    }

    if (date < today) {
      toast.warning("Não é possível reservar em datas passadas.");
      return;
    }

    try {
      setLoading(true);

      const sortedLessons = [...selectedLessons].sort((a, b) => a - b);
      const [mainLesson, ...extraLessons] = sortedLessons;

      const updateResponse = await fetch(
        `/api/reservations/${reservationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            sala_id: roomId,
            data: date,
            turno: shift,
            aula_numero: mainLesson,
            disciplina: subject,
          }),
        }
      );

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok) {
        toast.error(updateResult?.message || "Erro ao atualizar reserva.");
        return;
      }

      await Promise.all(
        extraLessons.map((lesson) =>
          fetch(`/api/reservations`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              sala_id: roomId,
              data: date,
              turno: shift,
              aula_numero: lesson,
              disciplina: subject,
            }),
          })
        )
      );

      toast.success("Reserva atualizada com horários extras!");
      router.push("/reservations");
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado ao salvar.");
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
    <div className="min-h-screen bg-linear-to-r from-blue-800 via-teal-400 to-teal-500 pt-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap gap-3 justify-between mb-6">
          <button
            onClick={() => router.push("/reservations")}
            className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-2xl shadow-lg transition font-semibold"
          >
            <Save size={18} />
            {loading ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="flex justify-center mb-5">
            <Image
              src="/images/unespar.png"
              alt="Logo UNESPAR"
              width={100}
              height={100}
              className="w-24 h-auto object-contain"
              priority
            />
          </div>

          <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">
            Editar Reserva
          </h1>

          <p className="text-center text-gray-500 mb-8">
            Atualize os dados da reserva com segurança
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Building2 size={16} />
                Sala reservada
              </label>

              <div className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-gray-700 font-medium">
                {currentRoom
                  ? `${currentRoom.nome_numero} — ${currentRoom.bloco}`
                  : "Sala não encontrada"}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <BookOpen size={16} />
                Disciplina
              </label>

              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Clock3 size={16} />
                Turno
              </label>

              <select
                value={shift}
                onChange={(e) => {
                  setShift(e.target.value);
                  setSelectedLessons([]);
                }}
                className="w-full border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="matutino">Matutino</option>
                <option value="vespertino">Vespertino</option>
                <option value="noturno">Noturno</option>
              </select>
            </div>

            <div className="md:col-span-2" ref={dropdownRef}>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                <Clock3 size={16} />
                Horários
              </label>

              <div
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full border rounded-2xl px-4 py-3 flex flex-wrap gap-2 items-center cursor-pointer bg-white hover:border-blue-300 transition min-h-14"
              >
                {selectedSlots.length > 0 ? (
                  selectedSlots.map((slot) => (
                    <div
                      key={slot.number}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {slot.time}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLesson(slot.number);
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400">
                    Selecione os horários...
                  </span>
                )}

                <ChevronDown
                  size={18}
                  className={`ml-auto transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {dropdownOpen && (
                <div className="mt-2 border rounded-2xl shadow-xl bg-white overflow-hidden">
                  {currentSlots.map((slot) => {
                    const isTaken = takenSlots.includes(slot.number);
                    const isSelected = selectedLessons.includes(slot.number);

                    return (
                      <button
                        key={slot.number}
                        type="button"
                        disabled={isTaken}
                        onClick={() => toggleLesson(slot.number)}
                        className={`w-full px-4 py-3 flex items-center justify-between text-left transition
                          ${
                            isTaken
                              ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-blue-50"
                          }`}
                      >
                        <span>{slot.time}</span>

                        {isTaken && (
                          <span className="text-xs font-medium text-red-400">
                            Ocupado
                          </span>
                        )}

                        {isSelected && !isTaken && <Check size={16} />}
                      </button>
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