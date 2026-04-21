"use client";

import { useEffect, useState } from "react";
import { getReport } from "@/services/reportsService";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState("monthly");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [period, month, year]);

  async function loadData() {
    try {
      let res;
      const today = new Date().toISOString().slice(0, 10);

      if (period === "daily") {
        res = await getReport("daily", { date: today });
      }

      if (period === "weekly") {
        res = await getReport("weekly", {
          startDate: "2026-04-14",
          endDate: "2026-04-20",
        });
      }

      if (period === "monthly") {
        res = await getReport("monthly", { month, year });
      }

      if (period === "semester") {
        res = await getReport("semester", { semester: 1, year });
      }

      setData(res);
    } catch (err) {
      console.error(err);
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen p-6 bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const porDia = data?.por_dia ?? [];
  const porSala = data?.por_sala ?? [];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 space-y-8">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Relatórios
          </h1>
          <p className="text-gray-500">
            Monitoramento inteligente das reservas
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Sistema online
        </div>
      </div>

      <div className="flex flex-wrap gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/40">

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-white dark:bg-gray-700 border px-4 py-2 rounded-xl shadow-sm"
        >
          <option value="daily">Diário</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
          <option value="semester">Semestral</option>
        </select>

        {period === "monthly" && (
          <motion.div
            key={period}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2"
          >
            <input
              type="number"
              value={month}
              min={1}
              max={12}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border px-3 py-2 rounded-xl w-24"
            />
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border px-3 py-2 rounded-xl w-32"
            />
          </motion.div>
        )}
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <AnimatedItem>
          <FancyCard title="Total" value={data.resumo?.total_reservas ?? 0} gradient="from-blue-500 to-indigo-500" />
        </AnimatedItem>

        <AnimatedItem>
          <FancyCard title="Canceladas" value={data.resumo?.canceladas ?? 0} gradient="from-red-500 to-pink-500" />
        </AnimatedItem>

        <AnimatedItem>
          <FancyCard title="Salas" value={data.resumo?.salas_utilizadas ?? 0} gradient="from-emerald-500 to-teal-500" />
        </AnimatedItem>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard title="Ocupação por dia" data={porDia}>
          <BarChart data={porDia}>
            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
            <Bar dataKey="total_reservas" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="canceladas" fill="#EF4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Evolução" data={porDia}>
          <LineChart data={porDia}>
            <defs>
              <linearGradient id="colorLine" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
            </defs>

            <XAxis dataKey="data" />
            <YAxis />
            <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />

            <Line
              type="monotone"
              dataKey="total_reservas"
              stroke="#6366F1"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ChartCard>

      </div>

      <div className="bg-white/80 dark:bg-gray-800 p-6 rounded-2xl shadow border">
        <h3 className="mb-4 font-semibold text-gray-700 dark:text-white">
          Ranking de salas
        </h3>

        <table className="w-full text-sm border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase">
              <th>Sala</th>
              <th>Bloco</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {porSala.map((room: any) => (
              <tr
                key={room.sala_id}
                className="bg-white dark:bg-gray-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition rounded-xl"
              >
                <td className="py-3 px-4 rounded-l-xl">{room.nome_numero}</td>
                <td className="px-4">{room.bloco}</td>
                <td className="px-4 font-semibold text-blue-600 rounded-r-xl">
                  {room.total_reservas}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/api/relatorios/mensal?mes=${month}&ano=${year}&formato=pdf`}
          target="_blank"
          className="bg-linear-to-r from-red-500 to-pink-500 text-white px-5 py-2 rounded-xl shadow hover:shadow-xl hover:scale-105 active:scale-95 transition"
        >
          PDF
        </a>

        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/api/relatorios/mensal?mes=${month}&ano=${year}&formato=csv`}
          target="_blank"
          className="bg-linear-to-r from-green-500 to-emerald-500 text-white px-5 py-2 rounded-xl shadow hover:shadow-xl hover:scale-105 active:scale-95 transition"
        >
          CSV
        </a>
      </div>
    </div>
  );
}


function AnimatedItem({ children }: any) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
    >
      {children}
    </motion.div>
  );
}

function FancyCard({ title, value, gradient }: any) {
  return (
    <div className={`group relative overflow-hidden bg-linear-to-r ${gradient} text-white p-6 rounded-2xl shadow-lg`}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-white/10" />
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/20 blur-3xl group-hover:translate-x-10 transition" />

      <p className="text-sm opacity-80">{title}</p>
      <h2 className="text-4xl font-bold mt-1">{value}</h2>
    </div>
  );
}

function ChartCard({ title, data, children }: any) {
  const isEmpty = !data || data.length === 0;

  return (
    <div className="bg-white/80 dark:bg-gray-800 backdrop-blur-md p-5 rounded-2xl shadow border">
      <h3 className="mb-4 font-semibold text-gray-700 dark:text-white">
        {title}
      </h3>

      {isEmpty ? (
        <div className="h-70 flex items-center justify-center text-gray-400 text-sm">
          Nenhum dado disponível nesse período
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          {children}
        </ResponsiveContainer>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border">
      <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
      <div className="h-8 w-16 bg-gray-300 rounded" />
    </div>
  );
}