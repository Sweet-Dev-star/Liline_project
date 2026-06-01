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
    const tok = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
    // safe fingerprint: length + first/last 4 chars (never the full secret)
    const fp = tok ? `len=${tok.length} ${tok.slice(0, 4)}...${tok.slice(-4)}` : "(empty)";
    try {
      const info = await lineClient().getBotInfo();
      return NextResponse.json({ lineToken: "ok", fingerprint: fp, basicId: info.basicId });
    } catch (e) {
      return NextResponse.json({ lineToken: "FAILED", fingerprint: fp, error: (e as Error).message });
    }
  }

  const users = await prisma.user.findMany({
    orderBy: { registeredAt: "desc" },
    include: { tags: true, surveys: true, scheduled: true },
    take: 50,
  });
  return NextResponse.json({ count: users.length, users });
}
