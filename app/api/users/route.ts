import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}