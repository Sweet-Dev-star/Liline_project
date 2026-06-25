import { lineClient } from "./client";

export interface LineProfile {
  displayName: string | null;
  pictureUrl: string | null;
}

/** Fetch a user's LINE profile; never throws (returns nulls on failure). */
export async function getProfileSafe(userId: string): Promise<LineProfile> {
  try {
    const p = await lineClient().getProfile(userId);
    return { displayName: p.displayName ?? null, pictureUrl: p.pictureUrl ?? null };
  } catch (e) {
    console.warn("[line] getProfile failed:", (e as Error).message);
    return { displayName: null, pictureUrl: null };
  }
}
