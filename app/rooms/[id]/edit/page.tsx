"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Save } from "lucide-react";

type Equipment = {
  id: string;
  nome: string;
  quantidade: number;
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}`
        );

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

  const handleRemoveEquipment = (equipmentId: string) => {
    setEquipamentos((prev) =>
      prev.filter((item) => item.id !== equipmentId)
    );
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome_numero: nomeNumero,
            bloco,
            capacidade,
            tipo_sala: tipoSala,
            ativo,
            equipamentos: equipamentos.map((eq) => ({
              id: eq.id,
              quantidade: eq.quantidade,
            })),
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao atualizar sala");
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
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition w-full sm:w-auto"
          >
            <Save size={18} />
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8">
            Editar Sala
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nome/Número
              </label>
              <input
                type="text"
                value={nomeNumero}
                onChange={(e) => setNomeNumero(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bloco
              </label>
              <input
                type="text"
                value={bloco}
                onChange={(e) => setBloco(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Capacidade
              </label>
              <input
                type="number"
                value={capacidade}
                onChange={(e) =>
                  setCapacidade(Number(e.target.value))
                }
                className="w-full border rounded-xl px-4 py-3 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={tipoSala}
                onChange={(e) => setTipoSala(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 text-black"
              >
                <option value="sala_aula">Sala de Aula</option>
                <option value="laboratorio">Laboratório</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 mt-6 text-black">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
            />
            Sala ativa
          </label>
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
              Equipamentos da Sala
            </h2>

            {equipamentos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {equipamentos.map((eq) => (
                  <div
                    key={eq.id}
                    className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {eq.nome}
                      </h3>
                      <p className="mt-2 text-sm text-gray-700">
                        Quantidade: <strong>{eq.quantidade}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleRemoveEquipment(eq.id)
                      }
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                Nenhum equipamento cadastrado.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}