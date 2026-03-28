"use client";

import Image from "next/image";

export default function IntroSection() {
  return (
    <div className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden px-4 md:px-16">
      <div className="absolute inset-0 bg-linear-to-r from-blue-900 to-teal-300"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
        <div className="-translate-x-2 md:-translate-x-4">
          <Image
            src="/images/logo-fusao-002.png"
            alt="fusao"
            width={400}
            height={100}
            className="object-contain w-auto h-auto"
          />
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-white">
            Sistema de Agendamento
          </h1>
        </div>
      </div>
    </div>
  );
}