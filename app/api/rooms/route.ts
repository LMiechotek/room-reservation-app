import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/salas`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

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

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const body = await request.json();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/salas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
        body: JSON.stringify(body),
      }
    );

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Erro rooms POST route:", error);

    return NextResponse.json(
      { error: "Erro interno ao criar sala" },
      { status: 500 }
    );
  }
}