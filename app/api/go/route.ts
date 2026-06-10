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
  const to = dest || serverEnv.publicBaseUrl || "https://yukatax.netlify.app";

  // best-effort click log (never block the redirect)
  if (dest) {
    await prisma.eventLog
      .create({ data: { type: `click_${target}`, payload: {} } })
      .catch(() => undefined);
  }

  // explicit Location so the destination URL is passed through verbatim
  // (NextResponse.redirect was appending the inbound ?to= query).
  return new Response(null, { status: 302, headers: { Location: to } });
}
