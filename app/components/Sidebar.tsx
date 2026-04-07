"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { label: "Dashboard", url: "/admin" },
    { label: "Usuários", url: "/admin/users" },
    { label: "Salas", url: "/admin/rooms" },
    { label: "Equipamentos", url: "/admin/equipment" },
    { label: "Reservas", url: "/admin/reservation" },
  ];

  return (
    <>
      <button
        className="md:hidden fixed top-24 left-4 z-50 p-2 bg-gray-800 text-white rounded"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={28} /> : <ArrowLeft size={28} />}
      </button>
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gray-800 text-white p-6 flex flex-col space-y-4
          w-64 z-40
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:flex
        `}
      >
        <h1 className="text-xl font-bold mb-4">Painel Admin</h1>
        {links.map((link) => (
          <Link
            key={link.url}
            href={link.url}
            className={`px-4 py-2 rounded hover:bg-gray-700 transition-colors ${
              pathname === link.url ? "bg-gray-700 font-semibold" : ""
            }`}
            onClick={() => setSidebarOpen(false)} 
          >
            {link.label}
          </Link>
        ))}
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}