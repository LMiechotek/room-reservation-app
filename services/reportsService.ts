const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type ReportPeriod = "daily" | "weekly" | "monthly" | "semester";

export async function getReport(
  period: ReportPeriod,
  options?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
    semester?: number;
  }
) {
  let url = "";

  switch (period) {
    case "daily":
      url = `${BASE_URL}/api/relatorios/diario?data=${options?.date}`;
      break;

    case "weekly":
      url = `${BASE_URL}/api/relatorios/semanal?data_inicio=${options?.startDate}&data_fim=${options?.endDate}`;
      break;

    case "monthly":
      url = `${BASE_URL}/api/relatorios/mensal?mes=${options?.month}&ano=${options?.year}`;
      break;

    case "semester":
      url = `${BASE_URL}/api/relatorios/semestral?semestre=${options?.semester}&ano=${options?.year}`;
      break;
  }


  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error("Erro ao buscar relatório");
  }

  return response.json();
}