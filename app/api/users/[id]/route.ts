import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = req.cookies.get("token")?.value;
    const body = await req.json();

    const { id } = await params;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        }
    );

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = req.cookies.get("token")?.value;

    const { id } = await params;

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${id}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    let data;
    try {
        data = await res.json();
    } catch {
        data = { ok: true };
    }

    return NextResponse.json(data, { status: res.status });
}