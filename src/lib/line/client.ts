import { messagingApi } from "@line/bot-sdk";
import { serverEnv } from "@/src/config/env";

/**
 * Single LINE Messaging API adapter. All outbound LINE calls go through here,
 * so swapping SDK versions or adding logging/retries happens in one place.
 *
 * Memoized per access token so we don't recreate the client every request.
 */
let cached: { token: string; client: messagingApi.MessagingApiClient } | null = null;

export function lineClient(): messagingApi.MessagingApiClient {
  const token = serverEnv.lineChannelAccessToken;
  if (cached && cached.token === token) return cached.client;
  const client = new messagingApi.MessagingApiClient({ channelAccessToken: token });
  cached = { token, client };
  return client;
}

/** Blob client for binary uploads (rich menu images). Lazy + memoized, like
 *  lineClient, so importing this module never reads secrets at build time. */
let cachedBlob: { token: string; client: messagingApi.MessagingApiBlobClient } | null = null;

export function lineBlobClient(): messagingApi.MessagingApiBlobClient {
  const token = serverEnv.lineChannelAccessToken;
  if (cachedBlob && cachedBlob.token === token) return cachedBlob.client;
  const client = new messagingApi.MessagingApiBlobClient({ channelAccessToken: token });
  cachedBlob = { token, client };
  return client;
}
