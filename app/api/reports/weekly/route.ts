import { NextResponse } from "next/server";
import { generateReport } from "@/lib/reports/generateReport";
import { filterWeekly } from "@/lib/reports/filters";

export async function GET() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
      { cache: "no-store" }
    );

    const data = await res.json();

    const filtered = filterWeekly(data);
    const report = generateReport(filtered);

    return NextResponse.json(report);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error generating weekly report" },
      { status: 500 }
    );
  }
}