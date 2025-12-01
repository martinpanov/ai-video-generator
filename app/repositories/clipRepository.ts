import { prisma } from "../lib/db";
import { STATUS, STEPS } from "@/app/constants";
import { ClipData } from "../types";
import { Clip } from "@/generated/prisma/client";

export async function clipCreate({
  clipData,
  jobId,
  userId
}: {
  clipData: ClipData;
  jobId: string;
  userId: string;
}) {
  try {
    return await prisma.clip.create({
      data: {
        title: clipData.title,
        description: clipData.description,
        post: clipData.post,
        clip: clipData.clip,
        timeStart: clipData.timeStart,
        timeEnd: clipData.timeEnd,
        status: STATUS.PENDING,
        jobId,
        userId
      }
    });
  } catch (error) {
    console.error('Failed to create clip:', error);

    const err = new Error('Failed to create clip');
    (err as any).step = STEPS.CLIP_VIDEO;
    throw err;
  }
}

export async function clipUpdate({
  clipId,
  data,
  step
}: {
  clipId: string;
  data: Partial<Clip>;
  step: string;
}) {
  try {
    return await prisma.clip.update({
      where: { id: clipId },
      data
    });
  } catch (error) {
    console.error('Failed to update clip:', error);

    const err = new Error('Failed to update clip');
    (err as any).step = step;
    throw err;
  }
}

export async function clipFindById(clipId: string) {
  return prisma.clip.findFirst({
    where: { id: clipId }
  });
}

export async function clipFindByJob(jobId: string) {
  return prisma.clip.findMany({
    where: { jobId },
    orderBy: { createdAt: 'asc' }
  });
}
