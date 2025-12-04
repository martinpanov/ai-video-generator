'use server';

import { prisma } from "../lib/db";
import { verifySession } from "../lib/session";
import { revalidatePath } from "next/cache";
import { apiFetch } from "../utils/api";

async function deleteClipFromS3(clipUrl: string | null) {
  if (!clipUrl) return;

  try {
    await apiFetch({
      endpoint: "/v1/s3/delete",
      method: "POST",
      body: clipUrl
    });
  } catch (error) {
    console.error('Failed to delete clip from S3:', error);
  }
}

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

  await deleteClipFromS3(clip.clipUrl);

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

  await Promise.all(
    clips.map(clip => deleteClipFromS3(clip.clipUrl))
  );

  await prisma.clip.deleteMany({
    where: {
      id: { in: clipIds },
      userId,
    },
  });

  revalidatePath("/clips");

  return { success: true, count: clips.length };
}
