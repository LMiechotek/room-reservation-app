"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { features } from "@/app/home/constants/constant";

export default function FeaturesSection() {
  const [userType, setUserType] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`,
          {
            credentials: "include", 
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserType(data.tipo); 
        } else {
          setUserType(""); 
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        setUserType("");
      }
    };

    fetchUser();
  }, []);

  const visibleFeatures = features.filter(
    (feature) => !feature.adminOnly || userType === "admin_cpd"
  );

  return (
    <div className="relative w-full py-20 px-4 md:px-16 bg-gray-100">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          visibleFeatures.length === 3
            ? "lg:grid-cols-3 max-w-7xl"
            : "lg:grid-cols-2 max-w-5xl"
        } gap-10 mx-auto`}
      >
        {visibleFeatures.map((feature) => {
          const Icon = feature.icon;

          return (
            <div
              key={feature.id}
              onClick={() => router.push(feature.path)}
              className="group relative flex flex-col sm:flex-row items-center sm:items-center rounded-2xl shadow-md overflow-hidden cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out bg-white min-h-55 p-6"
            >
              <div className="absolute top-4 right-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
                <ArrowUpRight size={22} />
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-blue-600 to-blue-800 shrink-0">
                <Icon size={34} className="text-white" />
              </div>
              <div className="flex-1 sm:pl-6 mt-4 sm:mt-0 text-center sm:text-left">
                <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                  {feature.title}
                </h3>

                {feature.description && (
                  <p className="text-gray-500 mt-2 text-sm md:text-base leading-relaxed">
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