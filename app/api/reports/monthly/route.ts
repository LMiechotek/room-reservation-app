import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const mes = searchParams.get("mes");
    const ano = searchParams.get("ano");

    if (!mes || !ano) {
      return NextResponse.json(
        { error: "mes e ano são obrigatórios" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/relatorios/mensal?mes=${mes}&ano=${ano}`,
      {
        cache: "no-store",
      }
    );

    const data = await res.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao buscar relatório mensal" },
      { status: 500 }
    );
  }
}