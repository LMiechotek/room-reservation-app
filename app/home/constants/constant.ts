import { BsCalendar, BsPerson, BsBuilding, BsDoorOpen } from "react-icons/bs";

export const Navlinks = [
  { id: 1, url: "/rooms", label: "Salas" },
  { id: 2, url: "/laboratories", label: "Laboratórios" },
  { id: 3, url: "/reservations", label: "Reservas" },
  { id: 4, url: "/login", label: "Login" }, // continua, Navbar filtra quando logado
];

export const features = [
  {
    id: 1,
    title: "Ver salas",
    description: "Ver salas disponíveis",
    icon: BsDoorOpen, 
  },
  {
    id: 2,
    title: "Laboratório",
    description: "Ver laboratório",
    icon: BsBuilding, 
  },
  {
    id: 3,
    title: "Minhas reservas",
    description: "Ver suas reservas",
    icon: BsCalendar, 
  },
  {
    id: 4,
    title: "Administração",
    description: "Gerenciar usuários e sistema",
    icon: BsPerson, 
  },
];