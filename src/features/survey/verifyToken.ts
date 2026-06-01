import { serverEnv } from "@/src/config/env";

/**
 * Verify a LIFF id_token server-side and return the LINE userId (sub).
 * Never trust a userId sent directly from the browser.
 */
export async function verifyLiffIdToken(idToken: string): Promise<string> {
  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: idToken, client_id: serverEnv.liffChannelId }),
  });
  if (!res.ok) throw new Error(`verify failed ${res.status}`);
  const data = (await res.json()) as { sub: string; aud: string };
  if (data.aud !== serverEnv.liffChannelId) throw new Error("aud mismatch");
  return data.sub;
}
