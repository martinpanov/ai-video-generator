import { prisma } from "../lib/db";
import { STATUS } from "@/app/constants";
import { ClipData } from "../types";

export async function clipCreate({
  clipData,
  jobId,
  userId
}: {
  clipData: ClipData;
  jobId: string;
  userId: string | null;
}) {
  return await prisma.clip.create({
    data: {
      title: clipData.title,
      description: clipData.description,
      post: clipData.post,
      clip: clipData.clip,
      timeStart: clipData.timeStart,
      timeEnd: clipData.timeEnd,
      clipUrl: null,
      status: STATUS.PENDING,
      jobId,
      userId
    }
  });
}

export async function clipUpdate({
  clipId,
  data
}: {
  clipId: string;
  data: {
    status?: string;
    clipUrl?: string;
    thumbnailUrl?: string;
    finalClipUrl?: string;
  };
}) {
  return await prisma.clip.update({
    where: { id: clipId },
    data
  });
}

export async function clipFindByJob(jobId: string) {
  return await prisma.clip.findMany({
    where: { jobId },
    orderBy: { createdAt: 'asc' }
  });
}

export async function clipFindCompleted(jobId: string) {
  return await prisma.clip.findMany({
    where: {
      jobId,
      status: STATUS.COMPLETED
    },
    orderBy: { createdAt: 'asc' }
  });
}

export async function clipFindNotCompleted(jobId: string) {
  return await prisma.clip.findMany({
    where: {
      jobId,
      status: { not: STATUS.COMPLETED }
    },
    orderBy: { createdAt: 'asc' }
  });
}

