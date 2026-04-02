"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Navlinks } from "@/app/home/constants/constant";
import { usePathname } from "next/navigation";

type Props = {
  showNav: boolean;
  closeNav: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  handleLogout: () => void;
};

export default function MobileNav({ showNav, closeNav, isLoggedIn, isAdmin, handleLogout }: Props) {
  const pathname = usePathname();

  return (
    <div
      className={`fixed top-0 ${
        showNav ? "left-0" : "-left-full"
      } w-full h-screen bg-black/50 z-50 transition-all duration-300 xl:hidden`}
    >
      <div className="w-[75%] sm:w-[60%] h-full bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" onClick={closeNav}>
            <Image
              src="/images/LOGO-UNIUV-UNESPAR-2.png"
              alt="Uniuv Unespar"
              width={180}
              height={60}
              className="h-12 w-auto object-contain"
            />
          </Link>
          <button onClick={closeNav}>
            <X size={28} />
          </button>
        </div>
        <div className="flex flex-col space-y-6">
          {pathname !== "/" && (
            <Link
              href="/"
              onClick={closeNav}
              className="text-lg text-blue-800 font-medium"
            >
              Início
            </Link>
          )}
          {Navlinks.map((link) => {
            if (link.url === "/login" && (isLoggedIn || pathname === "/login")) return null;
            return (
              <Link
                key={link.id}
                href={link.url}
                onClick={closeNav}
                className="text-lg text-blue-800 font-medium"
              >
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={closeNav}
              className="text-lg bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white font-medium"
            >
              Painel Administrativo
            </Link>
          )}
          {isLoggedIn && (
            <button
              onClick={() => {
                handleLogout();
                closeNav();
              }}
              className="text-lg text-red-600 font-medium"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}