import { prisma } from "../lib/db";

type VideoData = {
  videoUrl: string;
  videoWidth: number;
  videoHeight: number;
  srtUrl?: string;
  textUrl?: string;
  segmentsUrl?: string;
};

export async function videoCreate({
  jobId,
  userId,
  data
}: {
  jobId: string;
  userId: string;
  data: VideoData;
}) {
  return prisma.video.create({
    data: {
      ...data,
      jobId,
      userId
    }
  });
}

export async function videoUpdate({
  jobId,
  data
}: {
  jobId: string;
  data: Partial<VideoData>;
}) {
  return prisma.video.update({
    where: { jobId },
    data
  });
}

export async function videoFindByJob(jobId: string) {
  return prisma.video.findUnique({
    where: { jobId }
  });
}
