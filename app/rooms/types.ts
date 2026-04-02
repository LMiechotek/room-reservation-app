export type Room = {
  id: string;
  name: string;
  roomType: string;
  equipment: string;
  machines: string;
  capacity: number;
  status: "disponivel" | "ocupada" | "reservada";
};