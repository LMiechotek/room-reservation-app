import { NextRequest, NextResponse } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  const token = request.cookies.get("token")?.value;
  const { id } = await context.params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}`,
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

export async function PUT(request: NextRequest, context: Context) {
  const token = request.cookies.get("token")?.value;
  const { id } = await context.params;
  const body = await request.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  return NextResponse.json(data, {
    status: response.status,
  });
}
export async function DELETE(request: NextRequest, context: Context) {
  const token = request.cookies.get("token")?.value;
  const { id } = await context.params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/salas/${id}`,
    {
      method: "DELETE",
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