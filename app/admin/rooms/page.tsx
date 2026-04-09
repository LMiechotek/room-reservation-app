"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Home, Users, Monitor, Cpu, Building2, Edit, X, List, Plus, Save } from "lucide-react";
import { toast } from "react-toastify";

type RoomType = "sala_aula" | "laboratorio";

type Equipment = { id: string; nome: string };

type Room = {
  id: string;
  nome_numero: string;
  bloco: string;
  capacidade: number;
  tipo_sala: RoomType;
  equipamentos?: Equipment[];
  quantidade_pcs?: number;
};

type FormErrors = { roomName?: string; block?: string; capacity?: string; type?: string };

export default function RoomsPanel() {
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [equipmentsSelected, setEquipmentsSelected] = useState<{ [key: string]: number }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [block, setBlock] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState<RoomType>("sala_aula");
  const [machines, setMachines] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/equipamentos`);
        const data = await res.json();
        setEquipments(data);
      } catch {
        toast.error("Não foi possível carregar os equipamentos");
      }
    };

    const fetchRooms = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/salas`);
        const data = await res.json();
        setRooms(data);
      } catch {
        toast.error("Não foi possível carregar as salas");
      }
    };

    fetchEquipments();
    fetchRooms();
  }, []);

  const resetForm = () => {
    setRoomName("");
    setBlock("");
    setCapacity("");
    setType("sala_aula");
    setMachines("");
    setEquipmentsSelected({});
    setEditingId(null);
    setErrors({});
  };

  const toggleEquipment = (id: string) => {
    setEquipmentsSelected((prev) => {
      const newSelected = { ...prev };
      if (newSelected[id]) {
        delete newSelected[id];
      } else {
        newSelected[id] = 1; 
      }
      return newSelected;
    });
  };

  const updateEquipmentQuantity = (id: string, qty: number) => {
    setEquipmentsSelected((prev) => ({
      ...prev,
      [id]: qty,
    }));
  };

  const validateFields = () => {
    const newErrors: FormErrors = {};
    if (!roomName.trim()) newErrors.roomName = "O nome da sala é obrigatório";
    if (!block.trim()) newErrors.block = "O bloco é obrigatório";
    if (!capacity.trim()) newErrors.capacity = "A capacidade é obrigatória";
    if (!type.trim()) newErrors.type = "O tipo da sala é obrigatório";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;
    setLoading(true);

    try {
      const roomPayload = {
        nome_numero: roomName,
        bloco: block,
        capacidade: Number(capacity),
        tipo_sala: type,
        quantidade_pcs: type === "laboratorio" ? Number(machines) : undefined,
      };

      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/salas`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomPayload),
      });

      if (!res.ok) throw new Error("Erro ao salvar sala");
      const savedRoom = await res.json();

      for (const eqId in equipmentsSelected) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/salas/${savedRoom.id}/equipamentos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ equipamento_id: eqId, quantidade: equipmentsSelected[eqId] }),
        });
      }

      toast.success(editingId ? "Sala atualizada!" : "Sala cadastrada!");
      if (editingId) {
        setRooms(rooms.map((r) => (r.id === savedRoom.id ? savedRoom : r)));
      } else {
        setRooms([...rooms, savedRoom]);
      }

      resetForm();
      setActiveTab("list");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Erro ao salvar sala");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: Room) => {
    setRoomName(room.nome_numero);
    setBlock(room.bloco);
    setCapacity(String(room.capacidade));
    setType(room.tipo_sala);
    setMachines(room.quantidade_pcs ? String(room.quantidade_pcs) : "");
    setEquipmentsSelected(
      room.equipamentos?.reduce((acc, eq) => {
        acc[eq.id] = 1; 
        return acc;
      }, {} as { [key: string]: number }) || {}
    );
    setEditingId(room.id);
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta sala?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro ao excluir sala");
      setRooms(rooms.filter((r) => r.id !== id));
      toast.success("Sala excluída com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir sala");
    }
  };

  return (
    <>
      <div className="min-h-screen pt-24 bg-linear-to-br from-blue-900 via-blue-700 to-teal-500 px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "form" ? "bg-blue-700 text-white" : "bg-white text-blue-700"
              }`}
              onClick={() => setActiveTab("form")}
            >
              <Plus size={16} /> Cadastro
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition ${
                activeTab === "list" ? "bg-blue-700 text-white" : "bg-white text-blue-700"
              }`}
              onClick={() => setActiveTab("list")}
            >
              <List size={16} /> Lista
            </button>
          </div>

          {activeTab === "form" && (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
              <div className="flex justify-center mb-5">
                <Image
                  src="/images/unespar.png"
                  alt="Logo"
                  width={110}
                  height={110}
                  className="w-24 h-auto object-contain"
                  priority
                />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] text-center mb-2">
                {editingId ? "Editar Sala" : "Cadastro de Sala"}
              </h2>
              <p className="text-gray-500 text-center mb-6">
                {editingId
                  ? "Altere as informações da sala"
                  : "Cadastre novas salas e laboratórios facilmente"}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Home size={16} /> Nome / Número
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Ex: Sala 101 ou Lab 02"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Building2 size={16} /> Bloco
                  </label>
                  <input
                    type="text"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="Ex: Bloco C"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Users size={16} /> Capacidade
                  </label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Ex: 25"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                    <Building2 size={16} /> Tipo da sala
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as RoomType)}
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sala_aula">Sala</option>
                    <option value="laboratorio">Laboratório</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                    <Monitor size={16} /> Equipamentos
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-2">
                    {equipments.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition ${
                          equipmentsSelected[item.id]
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!equipmentsSelected[item.id]}
                          onChange={() => toggleEquipment(item.id)}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-gray-700">{item.nome}</span>
                        {equipmentsSelected[item.id] && (
                          <input
                            type="number"
                            value={equipmentsSelected[item.id]}
                            min={1}
                            onChange={(e) =>
                              updateEquipmentQuantity(item.id, Math.max(1, Number(e.target.value)))
                            }
                            className="w-16 border rounded px-2 py-1 text-sm"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
                {type === "laboratorio" && (
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
                      <Cpu size={16} /> Quantidade de PCs
                    </label>
                    <input
                      type="number"
                      value={machines}
                      onChange={(e) => setMachines(e.target.value)}
                      placeholder="Ex: 30"
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="md:col-span-2 w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl transition font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {loading ? "Salvando..." : editingId ? "Salvar Alterações" : "Cadastrar Sala"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "list" && (
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Salas cadastradas</h3>
              {rooms.length === 0 ? (
                <p className="text-gray-500">Nenhuma sala cadastrada.</p>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <li
                      key={room.id}
                      className="flex flex-col justify-between bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {room.nome_numero} - {room.bloco}
                        </p>
                        <p className="text-sm text-gray-500">
                          Capacidade: {room.capacidade} | Tipo: {room.tipo_sala}
                        </p>
                      </div>
                      <div className="flex justify-end gap-3 mt-3">
                        <button
                          className="flex items-center gap-1 text-yellow-600 hover:text-yellow-800 font-semibold"
                          onClick={() => handleEdit(room)}
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button
                          className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold"
                          onClick={() => handleDelete(room.id)}
                        >
                          <X size={16} /> Excluir
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}