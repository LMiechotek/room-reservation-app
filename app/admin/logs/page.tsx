"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { } from "lucide-react";
import { toast } from "react-toastify";

export default function EquipmentPanel() {

    type LogEntry = {
        id: number;
        acao: string;
        entidade: string;
        entidade_id: number;
        realizado_por: string;
        realizado_por_nome: string;
        realizado_por_email: string;
        detalhes: {
            turno?: string;
            sala_id?: number;
            data_reserva?: string;
            cancelado_por?: string;
            usuario_id_titular?: number;
        };
        criado_em: string;
    };

    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        const fetchEquipments = async () => {
            try {
                const res = await fetch(`/api/logs?limit=2`);
                if (!res.ok) throw new Error("Erro ao buscar equipamentos");
                const data = await res.json();
                setLogs(Array.isArray(data) ? data : [data]);
            } catch (error) {
                console.error(error);
                toast.error("Não foi possível carregar os equipamentos");
            }
        };
        fetchEquipments();
    }, []);

    const [page, setPage] = useState(1);
    const perPage = 3;

    const pagedLogs = logs.slice((page - 1) * perPage, page * perPage);

    return (
        <>
            <div className="min-h-screen pt-24 bg-linear-to-br from-blue-900 via-blue-700 to-teal-500 px-4 sm:px-6 py-8 sm:py-10">
                <div className="max-w-4xl mx-auto space-y-10">
                    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8">
                        <div className="flex justify-center mb-5">
                            <Image
                                src="/images/unespar.png"
                                alt="Logo"
                                width={110}
                                height={110}
                                className="w-24 h-auto object-contain"
                                priority
                            />
                        </div>

                        <div className="Logs whitespace-pre-wrap break-words gap-4 grid grid-cols-1">
                            {
                                pagedLogs.map((log) => (
                                    <div key={log.id} className="rounded-xl border bg-slate-50 p-4">
                                        <p><strong>Ação:</strong> {log.acao}</p>
                                        <p><strong>Entidade:</strong> {log.entidade}</p>
                                        <p><strong>Detalhes:</strong> {
                                            JSON.stringify(log.detalhes)
                                        }
                                        </p>
                                        <p><strong>Realizado por:</strong> {log.realizado_por_nome}</p>
                                        <p><strong>Criado em:</strong> {log.criado_em}</p>
                                    </div>
                                ))}
                        </div>
                        <div className="pagination flex justify-center items-center gap-4 mt-6">
                            <button
                                className={
                                    `\
                                    md:col-span-2 bg-blue-700 hover:bg-blue-800 text-white \
                                    py-3 rounded-xl transition font-semibold shadow-lg flex \
                                    items-center justify-center gap-2 ${page === 1 ? "opacity-50 cursor-not-allowed" : ""} \
                                    `
                                }
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                            >
                                Anterior
                            </button>
                            <span>Página {page}</span>
                            <button
                                className={
                                    `\
                                    md:col-span-2 bg-blue-700 hover:bg-blue-800 text-white \
                                    py-3 rounded-xl transition font-semibold shadow-lg flex \
                                    items-center justify-center gap-2 ${page === 22 ? "opacity-50 cursor-not-allowed" : ""} \
                                    `
                                }
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Próxima
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
