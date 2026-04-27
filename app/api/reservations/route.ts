import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const { search } = new URL(request.url);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reservas${search}`,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},

        cache: "no-store",
    },
  );
  console.log("SEARCH:", search);
  console.log("URL FINAL:", `${process.env.NEXT_PUBLIC_API_URL}/api/reservas${search}`);

const data = await response.json();

return NextResponse.json(data, {
  status: response.status,
});
}
export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const body = await request.json();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reservas`,
    {
      method: "POST",
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