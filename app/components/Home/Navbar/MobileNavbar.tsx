"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Navlinks } from "@/app/components/Home/constants/constant";

type Props = {
  showNav: boolean;
  closeNav: () => void;
};

export default function MobileNav({ showNav, closeNav }: Props) {
  return (
    <div
      className={`fixed top-0 ${
        showNav ? "left-0" : "-left-full"
      } w-full h-screen bg-black/50 z-50 transition-all duration-300 xl:hidden`}
    >
      {/* Menu lateral */}
      <div className="w-[75%] sm:w-[60%] h-full bg-white shadow-xl p-6">
        {/* Topo */}
        <div className="flex items-center justify-between mb-8">
          <Image
            src="/images/LOGO-UNIUV-UNESPAR-2.png"
            alt="Uniuv Unespar"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
          />

          <button onClick={closeNav}>
            <X size={28} />
          </button>
        </div>

        {/* Links */}
        <div className="flex flex-col space-y-6">
          {Navlinks.map((link) => (
            <Link
              key={link.id}
              href={link.url}
              onClick={closeNav}
              className="text-lg text-blue-800 font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}