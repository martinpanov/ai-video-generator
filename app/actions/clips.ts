'use server';

import { prisma } from "../lib/db";
import { verifySession } from "../lib/session";
import { revalidatePath } from "next/cache";
import { apiFetch } from "../utils/api";

async function deleteClipFromS3(clipUrl: string | null, thumbnailUrl: string | null) {
  try {
    await apiFetch({
      endpoint: "/v1/clips/delete",
      method: "POST",
      body: { clip_url: clipUrl, thumbnail_url: thumbnailUrl }
    });
  } catch (error) {
    console.error('Failed to delete clip from S3:', error);
  }
}

export async function deleteClip(clipId: string) {
  const userId = await verifySession();
  const clip = await prisma.clip.findUnique({
    where: { id: clipId },
  });

  if (!clip || clip.userId !== userId) {
    throw new Error("Clip not found or unauthorized");
  }

  await deleteClipFromS3(clip.clipUrl, clip.thumbnailUrl);

  await prisma.clip.delete({
    where: { id: clipId },
  });

  revalidatePath("/clips");

  return { success: true };
}

export async function deleteMultipleClips(clipIds: string[]) {
  const userId = await verifySession() || "";
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
    clips.map(clip => deleteClipFromS3(clip.clipUrl, clip.thumbnailUrl))
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
