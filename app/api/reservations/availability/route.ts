import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    const { searchParams } = new URL(request.url);

    const data = searchParams.get("data");
    const turno = searchParams.get("turno");
    const aulaNumero = searchParams.get("aula_numero");
    const tipoSala = searchParams.get("tipo_sala");

    const backendParams = new URLSearchParams();

    if (data) backendParams.set("data", data);
    if (turno) backendParams.set("turno", turno);
    if (aulaNumero) backendParams.set("aula_numero", aulaNumero);
    if (tipoSala) backendParams.set("tipo_sala", tipoSala);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reservas/disponibilidade?${backendParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const result = await response.json();

    return NextResponse.json(result, {
      status: response.status,
    });
  } catch (error) {
    console.error("Erro GET availability:", error);

    return NextResponse.json(
      { error: "Erro interno ao consultar disponibilidade." },
      { status: 500 }
    );
  }
}