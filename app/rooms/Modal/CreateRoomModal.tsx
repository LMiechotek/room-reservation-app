"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Home, Users, Monitor, Cpu, Building2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

type RoomType = "sala_aula" | "laboratorio";

type Equipment = {
  id: string;
  nome: string;
};

type SelectedEquipment = {
  id: string;
  quantidade: number;
};

type FormErrors = {
  roomName?: string;
  block?: string;
  capacity?: string;
  type?: string;
};

type Room = {
  id: string;
  name: string;
  roomType: RoomType | string;
  equipment: string;
  machines: string;
  capacity: number;
  status: string;
};

type Props = {
  onClose: () => void;
  onCreated: (newRoom: Room) => void;
};

export default function CreateRoomModal({
  onClose,
  onCreated,
}: Props) {
  const [roomName, setRoomName] = useState("");
  const [block, setBlock] = useState("");
  const [capacity, setCapacity] = useState("");
  const [type, setType] = useState<RoomType>("sala_aula");
  const [machines, setMachines] = useState("");
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [equipmentsSelected, setEquipmentsSelected] = useState<
    SelectedEquipment[]
  >([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/equipamentos`
        );
        const data = await res.json();
        setEquipments(data);
      } catch (err) {
        console.error("Erro ao buscar equipamentos:", err);
      }
    };

    fetchEquipments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const toggleEquipment = (id: string) => {
    setEquipmentsSelected((prev) => {
      const exists = prev.find((item) => item.id === id);

      if (exists) {
        return prev.filter((item) => item.id !== id);
      }

      return [...prev, { id, quantidade: 1 }];
    });
  };

  const updateEquipmentQuantity = (
    id: string,
    quantidade: number
  ) => {
    if (quantidade < 1) quantidade = 1;

    setEquipmentsSelected((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantidade } : item
      )
    );
  };

  const validateFields = () => {
    const newErrors: FormErrors = {};

    if (!roomName.trim()) {
      newErrors.roomName = "O nome da sala é obrigatório";
    }

    if (!block.trim()) {
      newErrors.block = "O bloco é obrigatório";
    }

    if (!capacity.trim()) {
      newErrors.capacity = "A capacidade é obrigatória";
    }

    if (!type.trim()) {
      newErrors.type = "O tipo da sala é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    try {
      const payload = {
        nome_numero: roomName,
        bloco: block,
        capacidade: Number(capacity),
        tipo_sala: type,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/salas`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao cadastrar sala");
      }

      const createdRoom = await res.json();
      const roomId = createdRoom.id;

      for (const equipment of equipmentsSelected) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${roomId}/equipamentos`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              equipamento_id: equipment.id,
              quantidade: equipment.quantidade,
            }),
          }
        );
      }

      onCreated({
        id: createdRoom.id,
        name: `${createdRoom.nome_numero} - ${createdRoom.bloco}`,
        roomType: createdRoom.tipo_sala,
        equipment: "Não informado",
        machines: machines || "Não informado",
        capacity: createdRoom.capacidade,
        status: "disponivel",
      });

      toast.success("Sala criada com sucesso!");

      setRoomName("");
      setBlock("");
      setCapacity("");
      setType("sala_aula");
      setMachines("");
      setEquipmentsSelected([]);
      setErrors({});

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao cadastrar sala");
    }
  };

  return (
    <>
      <ToastContainer />

      <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-2 sm:p-4">
        <div
          ref={modalRef}
          className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl border border-white/30 relative z-50 max-h-[95vh] flex flex-col overflow-hidden"
        >
          <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-4 sm:px-6 pt-4 pb-5 shadow-sm">
            <div className="flex justify-center">
              <Image
                src="/images/unespar.png"
                alt="Logo"
                width={110}
                height={110}
                className="object-contain w-20 sm:w-24 md:w-28 h-auto"
              />
            </div>

            <div className="text-center mt-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A]">
                Criar Nova Sala
              </h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Cadastre salas de aula e laboratórios
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2">
                  {equipments.map((eq) => {
                    const selected = equipmentsSelected.find(
                      (item) => item.id === eq.id
                    );

                    return (
                      <div
                        key={eq.id}
                        className={`border rounded-xl px-4 py-3 transition ${
                          selected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!selected}
                              onChange={() => toggleEquipment(eq.id)}
                              className="accent-blue-600"
                            />
                            <span className="text-sm text-gray-700">
                              {eq.nome}
                            </span>
                          </label>

                          {selected && (
                            <input
                              type="number"
                              min={1}
                              value={selected.quantidade}
                              onChange={(e) =>
                                updateEquipmentQuantity(
                                  eq.id,
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 border rounded-lg px-2 py-1 text-sm"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
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
            </div>
          </div>
          <div className="sticky bottom-0 bg-white  px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition"
            >
              Criar Sala
            </button>

            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 hover:bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}