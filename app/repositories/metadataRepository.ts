import { jobFind } from "./jobRepository";

export async function getMetadata(jobId: string) {
  const job = await jobFind(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const stepData = JSON.parse(job.stepData);
  return stepData.metadata;
}