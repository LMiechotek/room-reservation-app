"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Navlinks } from "@/app/components/Home/constants/constant";
import Link from "next/link";
import { Search, Menu } from "lucide-react";

type Props = {
  openNav: () => void;
};

export default function Navbar({ openNav }: Props) {
  const [navBg, setNavBg] = useState(false);

  useEffect(() => {
    const handler = () => {
      setNavBg(window.scrollY >= 90);
    };

    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      className={`transition-all duration-200 h-[12vh] z-20 fixed w-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.15)] ${
        navBg ? "border-b border-gray-300" : "border-b border-gray-100"
      }`}
    >
      <div className="flex items-center h-full justify-between w-[90%] mx-auto gap-2">
        {/* Logo */}
        <div className="flex items-center min-w-30 md:min-w-55">
          <Image
            src="/images/LOGO-UNIUV-UNESPAR-2.png"
            alt="Uniuv Unespar"
            width={220}
            height={70}
            className="h-10 md:h-14 w-auto object-contain"
            priority
          />
        </div>

        {/* Input de busca */}
        <div className="flex-1 mx-2 md:mx-4 lg:mx-8 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full border border-gray-300 rounded-full px-4 md:px-5 py-2 pr-10 md:pr-12 text-sm md:text-base outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              size={18}
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* navlinks desktop */}
        <div className="hidden xl:flex items-center space-x-10">
          {Navlinks.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              className="text-base text-[#1E3A8A] hover:text-blue-600 font-medium transition-all duration-200"
            >
              <p>{link.label}</p>
            </Link>
          ))}
        </div>

        {/* botão menu mobile */}
        <div className="xl:hidden">
          <button
            onClick={openNav}
            className="p-2 rounded-md text-[#1E3A8A] hover:text-blue-600 transition"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>
    </div>
  );
}