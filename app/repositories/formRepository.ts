import { Config } from "../types";
import { jobFind } from "./jobRepository";

export async function getFormData(jobId: string): Promise<Required<Config>> {
  const job = await jobFind(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  return JSON.parse(job.formData);
}