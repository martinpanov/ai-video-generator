import { prisma } from "../lib/db";

export async function getMetadata(jobId: string) {
  const job = await prisma.job.findFirst({
    where: { id: jobId }
  });

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const stepData = JSON.parse(job.stepData);
  return stepData.metadata;
}