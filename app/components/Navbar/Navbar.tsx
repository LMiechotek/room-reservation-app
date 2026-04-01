"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Navlinks } from "@/app/home/constants/constant";
import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  openNav: () => void;
};

export default function Navbar({ openNav }: Props) {
  const [navBg, setNavBg] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setNavBg(window.scrollY >= 90);
    };

    const updateLoginState = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    updateLoginState();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    setIsLoggedIn(false);
    router.replace("/login");
  };

  if (!mounted) return null;

  return (
    <div
      className={`transition-all duration-200 h-20 z-20 fixed top-0 left-0 w-full bg-white shadow-sm ${
        navBg ? "border-b border-gray-300" : "border-b border-gray-100"
      }`}
    >
      <div className="flex items-center h-full justify-between w-[90%] mx-auto gap-2">
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

        {pathname === "/" && (
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
        )}

        <div className="hidden xl:flex items-center space-x-10">
          {Navlinks.map((link) => {
            if (
              link.url === "/login" &&
              (isLoggedIn || pathname === "/login")
            ) {
              return null;
            }

            return (
              <Link
                key={link.id}
                href={link.url}
                className="text-base text-[#1E3A8A] hover:text-blue-600 font-medium transition-all duration-200"
              >
                {link.label}
              </Link>
            );
          })}

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="text-base text-[#1E3A8A] hover:text-red-500 font-medium transition-all duration-200"
            >
              Logout
            </button>
          )}
        </div>

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