import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { lineClient } from "@/src/lib/line/client";

// Local-only inspection endpoint (remove/guard before production).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);

  if (url.searchParams.get("check") === "line") {
    const tok = process.env.LINE_CHANNEL_ACCESS_TOKEN ?? "";
    const fp = tok ? `len=${tok.length} ${tok.slice(0, 4)}...${tok.slice(-4)}` : "(empty)";
    try {
      const info = await lineClient().getBotInfo();
      return NextResponse.json({ lineToken: "ok", fingerprint: fp, basicId: info.basicId });
    } catch (e) {
      return NextResponse.json({ lineToken: "FAILED", fingerprint: fp, error: (e as Error).message });
    }
  }

  // ?check=env -> show which asset/config env vars the server actually sees
  if (url.searchParams.get("check") === "env") {
    return NextResponse.json({
      mainVideo: process.env.NEXT_PUBLIC_MAIN_VIDEO_URL ?? "(unset)",
      ifaVideo: process.env.NEXT_PUBLIC_IFA_VIDEO_URL ?? "(unset)",
      schoolVideo: process.env.NEXT_PUBLIC_SCHOOL_VIDEO_URL ?? "(unset)",
      publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "(unset)",
      ifaBooking: process.env.IFA_BOOKING_URL ?? "(unset)",
      schoolLink: process.env.SCHOOL_LINK_URL ?? "(unset)",
    });
  }

  const users = await prisma.user.findMany({
    orderBy: { registeredAt: "desc" },
    include: { tags: true, surveys: true, scheduled: true },
    take: 50,
  });
  return NextResponse.json({ count: users.length, users });
}
