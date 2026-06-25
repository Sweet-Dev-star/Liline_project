import { NextResponse } from "next/server";
import { publicEnv } from "@/src/config/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    step: 5,
    stack: "next.js",
    liffConfigured: Boolean(publicEnv.liffId),
  });
}
