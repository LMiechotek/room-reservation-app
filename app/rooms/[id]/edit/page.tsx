"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Save, Plus } from "lucide-react";

type Equipment = {
  id: string;
  nome: string;
  quantidade: number;
};

type AvailableEquipment = {
  id: string;
  nome: string;
  descricao: string;
};

type EquipamentChange = {
  type: 'add' | 'remove';
  equipamentId: string;
  quantity?: number;
};

export default function EditRoomPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();

  const [nomeNumero, setNomeNumero] = useState("");
  const [bloco, setBloco] = useState("");
  const [capacidade, setCapacidade] = useState(0);
  const [tipoSala, setTipoSala] = useState("sala_aula");
  const [ativo, setAtivo] = useState(true);
  const [equipamentos, setEquipamentos] = useState<Equipment[]>([]);
  const [availableEquipments, setAvailableEquipments] = useState<AvailableEquipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}`);
        const data = await res.json();

        setNomeNumero(data.nome_numero);
        setBloco(data.bloco);
        setCapacidade(data.capacidade);
        setTipoSala(data.tipo_sala);
        setAtivo(data.ativo);
        setEquipamentos(data.equipamentos || []);
      } catch (error) {
        console.error("Erro ao buscar sala:", error);
      }
    };

    if (id) fetchRoom();
  }, [id]);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipamentos`);
        const data = await res.json();
        setAvailableEquipments(data || []);
      } catch (error) {
        console.error("Erro ao buscar equipamentos disponíveis:", error);
      }
    };
    fetchEquipments();
  }, []);

/*   const handleRemoveEquipment = async (equipmentId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}/equipamentos/${equipmentId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Erro ao remover equipamento");

      setEquipamentos((prev) => prev.filter((item) => item.id !== equipmentId));
    } catch (error) {
      console.error(error);
      alert("Erro ao remover equipamento");
    }
  };

  const handleAddEquipment = async () => {
    if (!selectedEquipmentId || quantity < 1) {
      alert("Selecione um equipamento e quantidade válida");
      return;
    }

    if (equipamentos.find((eq) => eq.id === selectedEquipmentId)) {
      alert("Equipamento já adicionado");
      return;
    }

    const added = availableEquipments.find((eq) => eq.id === selectedEquipmentId);
    if (!added) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}/equipamentos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ equipamento_id: selectedEquipmentId, quantidade: quantity }),
        }
      );

      if (!res.ok) throw new Error("Erro ao adicionar equipamento");

      setEquipamentos((prev) => [
        ...prev,
        { id: added.id, nome: added.nome, quantidade: quantity },
      ]);

      setSelectedEquipmentId("");
      setQuantity(1);
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar equipamento");
    }
  }; */

  const handleUpdateRoom = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_numero: nomeNumero,
          bloco,
          capacidade,
          tipo_sala: tipoSala,
          ativo,
        }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar sala");

      for (const change of equipmentChangesQueue) {
        try {
          if (change.type === 'add') {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}/equipamentos`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ equipamento_id: change.equipamentId, quantidade: change.quantity }),
              }
            );
            if (!res.ok) {
              console.error('Erro ao adicionar equipamento: ', await res.text());
              throw new Error("Erro ao adicionar equipamento");
            };
          } else if (change.type === 'remove') {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}/equipamentos/${change.equipamentId}`,
              { method: "DELETE" }
            );
            if (!res.ok) {
              console.error('Erro ao remover equipamento: ', await res.text());
              throw new Error("Erro ao remover equipamento");
            };
          }
        } catch (error) {
          console.error('Erro ao atualizar a sala:' + error)
          return;
        }
      }

      alert("Sala atualizada com sucesso!");
      router.push(`/rooms/${id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar sala");
    } finally {
      setLoading(false);
    }
  };


  const [equipmentChangesQueue, setEquipmentChangesQueue] = useState<EquipamentChange[]>([]);

  useEffect(() => {
    console.log('Queue updated: ', equipmentChangesQueue)
  }, [equipmentChangesQueue]);

  const enququeRemoveEquipament = (equipmentId: string) => {
    try {
      setEquipmentChangesQueue(prev => [
        ...prev,
        { type: 'remove', equipamentId: equipmentId }
      ]);

      setEquipamentos((prev) => prev.filter((item) => item.id !== equipmentId));
    } catch (error) {
      console.error(error);
      alert("Erro ao remover equipamento");
    }
  };

  const enququeAddEquipment = async () => {
    if (!selectedEquipmentId || quantity < 1) {
      alert("Selecione um equipamento e quantidade válida");
      return;
    }

    if (equipamentos.find((eq) => eq.id === selectedEquipmentId)) {
      alert("Equipamento já adicionado");
      return;
    }

    const added = availableEquipments.find((eq) => eq.id === selectedEquipmentId);
    if (!added) return;

    try {
      setEquipmentChangesQueue(prev => [
        ...prev,
        { type: 'add', equipamentId: selectedEquipmentId, quantity }
      ]);

      setEquipamentos((prev) => [
        ...prev,
        { id: added.id, nome: added.nome, quantidade: quantity },
      ]);

      setSelectedEquipmentId("");
      setQuantity(1);
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar equipamento");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-r from-blue-800 via-teal-400 to-teal-500 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button
            onClick={() => router.push(`/rooms/${id}`)}
            className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-xl shadow hover:shadow-md transition w-full sm:w-auto"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <button
            onClick={handleUpdateRoom}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition w-full sm:w-auto"
          >
            <Save size={18} />
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">Editar Sala</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome/Número</label>
              <input
                type="text"
                value={nomeNumero}
                onChange={(e) => setNomeNumero(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bloco</label>
              <input
                type="text"
                value={bloco}
                onChange={(e) => setBloco(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Capacidade</label>
              <input
                type="number"
                value={capacidade}
                onChange={(e) => setCapacidade(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
              <select
                value={tipoSala}
                onChange={(e) => setTipoSala(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="sala_aula">Sala de Aula</option>
                <option value="laboratorio">Laboratório</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 mt-6 text-black">
            <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
            Sala ativa
          </label>

          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">Equipamentos da Sala</h2>

            {equipamentos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {equipamentos.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{eq.nome}</h3>
                      <p className="mt-2 text-sm text-gray-700">
                        Quantidade: <strong>{eq.quantidade}</strong>
                      </p>
                    </div>
                    {/* <button onClick={() => handleRemoveEquipment(eq.id)} className="text-red-500 hover:text-red-700 transition"> */}
                    <button onClick={() => enququeRemoveEquipament(eq.id)} className="text-red-500 hover:text-red-700 transition">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-6">Nenhum equipamento cadastrado.</p>
            )}

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Adicionar Equipamento</h3>
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <select
                  value={selectedEquipmentId}
                  onChange={(e) => setSelectedEquipmentId(e.target.value)}
                  className="w-full md:w-2/3 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 transition"
                >
                  <option value="">Selecione um equipamento</option>
                  {availableEquipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nome} - {eq.descricao}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full md:w-1/6 border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Qtd"
                />

                {/* <button
                  onClick={handleAddEquipment}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition w-full md:w-1/6"
                > */}
                <button
                  onClick={enququeAddEquipment}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl transition w-full md:w-1/6"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}