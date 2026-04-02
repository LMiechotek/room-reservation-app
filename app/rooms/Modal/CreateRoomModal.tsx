import React, { useState } from "react";
import { Room } from "../types";

type Props = {
  onClose: () => void;
  onCreated: (newRoom: Room) => void;
};

export default function CreateRoomModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [bloco, setBloco] = useState("");
  const [roomType, setRoomType] = useState("");
  const [capacity, setCapacity] = useState<number>(0);

  const handleCreate = async () => {
    const payload = {
      nome_numero: name || "Sala Teste",
      bloco: bloco || "Bloco X",
      capacidade: capacity || 0,
      tipo_sala: roomType || "Não informado",
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/salas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar a sala");
      }

      const createdRoom = await response.json();

      const newRoom: Room = {
        id: createdRoom.id,
        name: `${createdRoom.nome_numero} - ${createdRoom.bloco}`,
        roomType: createdRoom.tipo_sala || "Não informado",
        equipment: "Não informado",
        machines: "Não informado",
        capacity: createdRoom.capacidade,
        status: "disponivel",
      };

      onCreated(newRoom);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Não foi possível criar a sala");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative z-50">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Criar Nova Sala
        </h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nome da sala"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Bloco"
            value={bloco}
            onChange={(e) => setBloco(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Tipo de sala"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Capacidade"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCreate}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
          >
            Criar
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}