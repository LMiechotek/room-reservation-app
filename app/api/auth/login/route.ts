import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { message: "Body inválido ou vazio" },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const raw = await backendResponse.text();

    if (!raw) {
      return NextResponse.json(
        { message: "Backend retornou resposta vazia" },
        { status: 502 }
      );
    }
    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { message: "Resposta inválida do backend" },
        { status: 502 }
      );
    }

    if (data?.usuario && data.usuario.ativo === false) {
      return NextResponse.json(
        { message: "Usuário desativado" },
        { status: 401 }
      );
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: data?.message || "Email ou senha inválidos" },
        { status: backendResponse.status }
      );
    }

    if (!data?.token) {
      return NextResponse.json(
        { message: "Token não retornado pelo backend" },
        { status: 401 }
      );
    }

    const response = NextResponse.json(data);

    response.cookies.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch (error) {
    console.error("Erro route login:", error);

    return NextResponse.json(
      { message: "Erro interno no login" },
      { status: 500 }
    );
  }
}