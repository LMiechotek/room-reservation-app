"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", url: "/admin" },
    { label: "Usuários", url: "/admin/users" },
    { label: "Salas", url: "/admin/rooms" },
    { label: "Equipamentos", url: "/admin/equipment" },
  ];

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col p-6 space-y-4">
      <h1 className="text-xl font-bold mb-4">Painel Admin</h1>
      {links.map((link) => (
        <Link
          key={link.url}
          href={link.url}
          className={`px-4 py-2 rounded hover:bg-gray-700 ${
            pathname === link.url ? "bg-gray-700 font-semibold" : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
    </aside>
  );
}