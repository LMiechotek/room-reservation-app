import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/salas`,
      {
        method: "GET",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Erro rooms GET route:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar salas" },
      { status: 500 }
    );
  }
}