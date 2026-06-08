import type { Branch, SurveyInput } from "@/src/shared/branch";
import { prisma } from "@/src/lib/db";

/**
 * Persist a completed survey: upsert the user with their branch, record the
 * response, and apply segmentation tags. Idempotent on tags.
 */
export async function saveSurvey(
  userId: string,
  input: SurveyInput,
  branch: Branch
): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    update: { branch },
    create: { id: userId, status: "active", branch },
  });

  // NOTE: the `stance` DB column is repurposed to store the consultation wish
  // (yes/no) — avoids a schema migration on the live DB.
  await prisma.surveyResponse.create({
    data: { userId, assets: input.assets, income: input.income, stance: input.consult, branch },
  });

  // On resubmit, clear prior branch/assets/consult tags so they don't accumulate
  // stale values (e.g. both branch:school and branch:nurture).
  await prisma.userTag.deleteMany({
    where: {
      userId,
      OR: [
        { tag: { startsWith: "branch:" } },
        { tag: { startsWith: "assets:" } },
        { tag: { startsWith: "consult:" } },
        { tag: { startsWith: "stance:" } },
      ],
    },
  });

  const tags = [`branch:${branch}`, `assets:${input.assets}`, `consult:${input.consult}`];
  for (const tag of tags) {
    await prisma.userTag.upsert({
      where: { userId_tag: { userId, tag } },
      update: {},
      create: { userId, tag },
    });
  }
}
