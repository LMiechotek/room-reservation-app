"use client";

import Link from "next/link";
import { User, Laptop, Home, ArrowRight, BookOpen, FileText } from "lucide-react";

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
    url: "/admin/reservation",
  },
  {
    id: 5,
    title: "Logs",
    icon: BookOpen,
    url: "/admin/logs",
  },
  {
    id: 6,
    title: "Relatórios",
    description: "Exportação de dados, análises e relatórios em PDF/CSV.",
    icon: FileText,
    url: "/admin/reports",
  }
];

export default function AdminDashboard() {
  return (
    <div className="w-full min-h-screen bg-linear-to-b from-slate-50 to-gray-100 pt-28 px-4 sm:px-8 md:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 px-2 sm:px-0">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800">
            Painel Administrativo
          </h1>
          <p className="text-gray-500 mt-3 text-sm sm:text-base md:text-lg">
            Gerencie usuários, salas e equipamentos em um só lugar.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {adminFeatures.map((feature) => {
            const Icon = feature.icon;

            return (
              <Link
                key={feature.id}
                href={feature.url}
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-linear-to-br from-blue-600 to-blue-800 shadow-md">
                    <Icon size={24} className="sm:text-white" />
                  </div>
                  <ArrowRight className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
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