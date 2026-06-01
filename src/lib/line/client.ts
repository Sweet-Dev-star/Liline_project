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
