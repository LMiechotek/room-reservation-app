"use client";

import Link from "next/link";
import { User, Laptop, Home } from "lucide-react";

const adminFeatures = [
    {
        id: 1,
        title: "Usuários",
        description: "Gerencie os usuários do sistema",
        icon: User,
        url: "/admin/users",
    },
    {
        id: 2,
        title: "Salas",
        description: "Cadastre e gerencie salas",
        icon: Home,
        url: "/admin/rooms",
    },
    {
        id: 3,
        title: "Equipamentos",
        description: "Cadastre e gerencie equipamentos",
        icon: Laptop,
        url: "/admin/equipment",
    },
];

export default function AdminDashboard() {
    return (
        <div className="w-full min-h-screen bg-gray-100 pt-20 md:pt-20 px-4 md:px-16">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
                Painel Administrativo
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {adminFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <Link
                            key={feature.id}
                            href={feature.url}
                            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
                        >
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-blue-600 to-blue-800 mb-4">
                                <Icon size={28} className="text-white" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 mt-2 text-sm md:text-base">
                                    {feature.description}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}