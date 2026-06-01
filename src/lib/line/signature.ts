import { validateSignature } from "@line/bot-sdk";
import { serverEnv } from "@/src/config/env";

/** Verify a LINE webhook request's signature against the raw body. */
export function verifyLineSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  return validateSignature(rawBody, serverEnv.lineChannelSecret, signature);
}
