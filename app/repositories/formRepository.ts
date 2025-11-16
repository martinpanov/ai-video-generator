import prisma from "../lib/db";
import { Config } from "../types";

export async function getFormData(jobId: string): Promise<Required<Config>> {
  const job = await prisma.job.findUnique({
    where: { id: jobId }
  });

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  return JSON.parse(job.formData);
}