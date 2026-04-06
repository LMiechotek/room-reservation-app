"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X } from "lucide-react";
import MobileNav from "./MobileNavbar";
import { Navlinks } from "@/app/home/constants/constant";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const [navBg, setNavBg] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isLoggedIn = !!user;
  const isAdmin = user?.tipo === "admin_cpd";

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setNavBg(window.scrollY >= 90);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!mounted) return null;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 bg-white shadow-sm ${
          navBg ? "border-b border-gray-300" : "border-b border-gray-100"
        }`}
      >
        <div className="flex items-center justify-between h-20 w-[90%] mx-auto">
          <div className="flex items-center min-w-30 md:min-w-55">
            <Link href="/">
              <Image
                src="/images/LOGO-UNIUV-UNESPAR-2.png"
                alt="Uniuv Unespar"
                width={220}
                height={70}
                className="h-10 md:h-14 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          {pathname === "/" && (
            <div className="flex-1 mx-2 md:mx-4 lg:mx-8 max-w-md">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-full px-4 md:px-5 py-2 pr-10 md:pr-12 text-sm md:text-base outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search
                  size={18}
                  className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          )}
          <div className="hidden xl:flex items-center space-x-6 md:space-x-10">
            <Link
              href="/"
              className={`text-base font-medium transition-all duration-200 ${
                pathname === "/" ? "text-blue-600" : "text-[#1E3A8A] hover:text-blue-600"
              }`}
            >
              Início
            </Link>

            {Navlinks.map((link) => {
              if (link.url === "/login" && (isLoggedIn || pathname === "/login")) return null;
              return (
                <Link
                  key={link.id}
                  href={link.url}
                  className={`text-base font-medium transition-all duration-200 ${
                    pathname === link.url ? "text-blue-600" : "text-[#1E3A8A] hover:text-blue-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {isAdmin && pathname !== "/admin" && (
              <Link
                href="/admin"
                className="text-base font-medium text-[#1E3A8A] hover:text-blue-600 transition-all duration-200"
              >
                Painel Administrativo
              </Link>
            )}

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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#1E3A8A] hover:text-blue-600 transition"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      <MobileNav
        showNav={mobileMenuOpen}
        closeNav={() => setMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        handleLogout={handleLogout}
      />

      <div className="h-20" />
    </>
  );
}