import { NextResponse } from "next/server";
import { seedDemoData } from "@/db/demo-seed";

export async function POST() {
  try {
    seedDemoData();
    return NextResponse.json({ success: true, message: "Demo data seeded" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to seed demo data" },
      { status: 500 }
    );
  }
}
