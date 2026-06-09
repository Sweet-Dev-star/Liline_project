import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/db";
import { serverEnv } from "@/src/config/env";
import { resolveTarget } from "@/src/lib/track";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Click-tracking redirect for conversion links (Spir / マネトレ大学).
 * GET /api/go?to=consult|school|mtu  -> logs a click, then 302 to the real URL.
 * Lets the analytics dashboard measure the final conversion stage.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const target = url.searchParams.get("to") ?? "";
  const dest = resolveTarget(target);

  // unknown target -> send to the site root rather than erroring on the user
  if (!dest) {
    return NextResponse.redirect(serverEnv.publicBaseUrl || "https://yukatax.netlify.app", 302);
  }

  // best-effort click log (never block the redirect)
  await prisma.eventLog
    .create({ data: { type: `click_${target}`, payload: {} } })
    .catch(() => undefined);

  return NextResponse.redirect(dest, 302);
}
