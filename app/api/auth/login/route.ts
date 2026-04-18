import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: data?.message || "Email ou senha inválidos" },
        { status: backendResponse.status }
      );
    }

    if (!data?.token) {
      return NextResponse.json(
        { message: "Token não retornado pelo backend" },
        { status: 500 }
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