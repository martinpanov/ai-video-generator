'use server';

import { prisma } from "../lib/db";
import { verifySession } from "../lib/session";
import { revalidatePath } from "next/cache";

export async function deleteClip(clipId: string) {
  const userId = await verifySession();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const clip = await prisma.clip.findUnique({
    where: { id: clipId },
  });

  if (!clip || clip.userId !== userId) {
    throw new Error("Clip not found or unauthorized");
  }

  await prisma.clip.delete({
    where: { id: clipId },
  });

  revalidatePath("/clips");

  return { success: true };
}

export async function deleteMultipleClips(clipIds: string[]) {
  const userId = await verifySession();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const clips = await prisma.clip.findMany({
    where: {
      id: { in: clipIds },
      userId,
    },
  });

  if (clips.length !== clipIds.length) {
    throw new Error("Some clips not found or unauthorized");
  }

  await prisma.clip.deleteMany({
    where: {
      id: { in: clipIds },
      userId,
    },
  });

  revalidatePath("/clips");

  return { success: true, count: clips.length };
}
