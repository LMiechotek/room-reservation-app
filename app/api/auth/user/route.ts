import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Não autenticado" },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const raw = await res.text();

    let data;
    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      console.error("Resposta inválida do backend /user:", raw);

      return NextResponse.json(
        { message: "Resposta inválida do backend" },
        { status: 502 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Erro ao buscar usuário" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, {
      status: 200,
    });

  } catch (error) {
    console.error("Erro auth/user:", error);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );
  }
}