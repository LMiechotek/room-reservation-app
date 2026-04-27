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
      if (!options?.date) {
        throw new Error("Parâmetro 'date' é obrigatório");
      }
      url = `${BASE_URL}/api/relatorios/diario?data=${options.date}`;
      break;

    case "weekly":
      if (!options?.startDate) {
        throw new Error("Parâmetro 'data_inicio' é obrigatório");
      }

      url = `${BASE_URL}/api/relatorios/semanal?data_inicio=${options.startDate}`;
      break;

    case "monthly":
      if (!options?.month || !options?.year) {
        throw new Error("Parâmetros 'month' e 'year' são obrigatórios");
      }
      url = `${BASE_URL}/api/relatorios/mensal?mes=${options.month}&ano=${options.year}`;
      break;

    case "semester":
      if (!options?.semester || !options?.year) {
        throw new Error("Parâmetros 'semester' e 'year' são obrigatórios");
      }
      url = `${BASE_URL}/api/relatorios/semestral?semestre=${options.semester}&ano=${options.year}`;
      break;

    default:
      throw new Error("Período inválido");
  }

  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Erro backend:", error);
    throw new Error("Erro ao buscar relatório");
  }

  return response.json();
}