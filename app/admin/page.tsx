"use client";

import Link from "next/link";
import { User, Laptop, Home, ArrowRight, BookOpen } from "lucide-react";

const adminFeatures = [
  {
    id: 1,
    title: "Usuários",
    description: "Gerencie cadastros, permissões e acessos do sistema.",
    icon: User,
    url: "/admin/users",
  },
  {
    id: 2,
    title: "Salas",
    description: "Cadastre novas salas e organize os ambientes.",
    icon: Home,
    url: "/admin/rooms",
  },
  {
    id: 3,
    title: "Equipamentos",
    description: "Controle os equipamentos disponíveis para uso.",
    icon: Laptop,
    url: "/admin/equipment",
  },
    {
    id: 4,
    title: "Reservas",
    description: "Gerencie reservas de salas e organize a agenda.",
    icon: BookOpen,
    url: "/admin/reservations", 
  },
];

export default function AdminDashboard() {
  return (
    <div className="w-full min-h-screen bg-linear-to-b from-slate-50 to-gray-100 pt-28 px-4 md:px-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
            Painel Administrativo
          </h1>
          <p className="text-gray-500 mt-3 text-sm md:text-base">
            Gerencie usuários, salas e equipamentos em um só lugar.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {adminFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.id}
                href={feature.url}
                className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-blue-800 shadow-md">
                    <Icon size={28} className="text-white" />
                  </div>

                  <ArrowRight className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>

                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}