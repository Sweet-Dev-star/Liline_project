import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { lineClient } from "@/src/lib/line/client";

// Local-only inspection endpoint (remove/guard before production).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // ?check=line -> verify the DEPLOYED access token can call the LINE API
  if (url.searchParams.get("check") === "line") {
    try {
      const info = await lineClient().getBotInfo();
      return NextResponse.json({ lineToken: "ok", basicId: info.basicId, displayName: info.displayName });
    } catch (e) {
      return NextResponse.json({ lineToken: "FAILED", error: (e as Error).message }, { status: 200 });
    }
  }

  const users = await prisma.user.findMany({
    orderBy: { registeredAt: "desc" },
    include: { tags: true, surveys: true, scheduled: true },
    take: 50,
  });
  return NextResponse.json({ count: users.length, users });
}
