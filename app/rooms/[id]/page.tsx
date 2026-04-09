"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Users,
  Monitor,
  Building2,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";

type Equipment = {
  id: string;
  nome: string;
  descricao?: string;
  quantidade: number;
};

type Room = {
  id: string;
  nome_numero: string;
  bloco: string;
  tipo_sala: string;
  capacidade: number;
  ativo: boolean;
  equipamentos: Equipment[];
};

export default function RoomDetailsPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`,
          { credentials: "include" }
        );
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.tipo === "admin_cpd");
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        setIsAdmin(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchRoom = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}`
        );

        if (!res.ok) {
          throw new Error("Erro ao buscar sala");
        }

        const data = await res.json();
        setRoom(data);
      } catch (error) {
        console.error(error);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = confirm("Deseja realmente excluir esta sala?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Erro ao excluir sala");
      }

      router.push("/rooms");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir sala");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white text-lg animate-pulse">
        Carregando detalhes da sala...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-200 text-lg">
        Sala não encontrada
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-blue-800 via-teal-400 to-teal-500 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button
            onClick={() => router.push("/rooms")}
            className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-xl shadow hover:shadow-md transition w-full sm:w-auto"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          {isAdmin && (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push(`/rooms/${id}/edit`)}
                className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl transition w-full sm:w-auto"
              >
                <Pencil size={18} />
                Editar
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition w-full sm:w-auto"
              >
                <Trash2 size={18} />
                Excluir
              </button>
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 wrap-break-word">
                {room.nome_numero}
              </h1>
              <p className="text-gray-500 mt-2">{room.bloco}</p>
            </div>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 text-blue-600">
                <Users />
                <span className="font-semibold">Capacidade</span>
              </div>
              <p className="text-2xl font-bold mt-3">{room.capacidade}</p>
            </div>

            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3 text-purple-600">
                <Building2 />
                <span className="font-semibold">Tipo</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold mt-3">
                {room.tipo_sala === "sala_aula" ? "Sala de Aula" : "Laboratório"}
              </p>
            </div>

            <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
              <div className="flex items-center gap-3 text-green-600">
                <Monitor />
                <span className="font-semibold">Equipamentos</span>
              </div>
              <p className="text-2xl font-bold mt-3">{room.equipamentos.length}</p>
            </div>
          </div>
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Equipamentos da Sala</h2>

            {room.equipamentos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {room.equipamentos.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm"
                  >
                    <h3 className="font-bold text-lg text-gray-800 wrap-break-word">{eq.nome}</h3>

                    {eq.descricao && (
                      <p className="text-gray-500 mt-2 wrap-break-word">{eq.descricao}</p>
                    )}

                    <p className="mt-3 text-sm text-gray-700">
                      Quantidade: <strong>{eq.quantidade}</strong>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum equipamento cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}