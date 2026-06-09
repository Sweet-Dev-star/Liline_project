import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { serverEnv } from "@/src/config/env";
import { SUPPRESS_TAG } from "@/src/features/admin/broadcast";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Suppress / un-suppress subscribers (配信停止・再開). Bearer-guarded.
 * POST /api/admin/users/suppress   body: { ids: string[], suppress?: boolean }
 * Suppressing tags the user (excluded from broadcasts) and cancels pending drips.
 * NOTE: LINE has no API to make the user's app block us — this is internal
 * suppression (we simply stop sending), per the spec.
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!serverEnv.cronSecret || token !== serverEnv.cronSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { ids?: unknown; suppress?: unknown } | null;
  const ids = Array.isArray(body?.ids)
    ? (body!.ids as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  const suppress = body?.suppress !== false; // default: suppress
  if (!ids.length) return NextResponse.json({ error: "no ids provided" }, { status: 400 });

  if (suppress) {
    await prisma.userTag.createMany({
      data: ids.map((userId) => ({ userId, tag: SUPPRESS_TAG })),
      skipDuplicates: true,
    });
    // stop any pending drips for the suppressed users
    await prisma.scheduledMessage.updateMany({
      where: { userId: { in: ids }, status: "pending" },
      data: { status: "cancelled" },
    });
  } else {
    await prisma.userTag.deleteMany({ where: { userId: { in: ids }, tag: SUPPRESS_TAG } });
  }

  return NextResponse.json({ ok: true, updated: ids.length, suppress });
}
