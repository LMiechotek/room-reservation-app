"use client";

import { features } from "@/app/components/Home/constants/constant";

export default function FeaturesSection() {
  return (
    <div className="relative w-full py-16 px-4 md:px-16 bg-gray-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="flex flex-col sm:flex-row items-center sm:items-start rounded-xl shadow-md overflow-hidden cursor-pointer hover:scale-105 hover:shadow-xl transition-transform duration-300 ease-in-out bg-white"
            >
              {/* Ícone em círculo */}
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-blue-600 to-blue-800 m-4 shrink-0">
                <Icon size={28} className="text-white" />
              </div>

              {/* Texto */}
              <div className="flex-1 p-4 sm:p-6 text-center sm:text-left">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                  {feature.title}
                </h3>
                {feature.description && (
                  <p className="text-gray-500 mt-1 text-sm md:text-base">
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}