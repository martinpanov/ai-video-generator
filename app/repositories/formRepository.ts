import { RequiredFormDataType } from "../types";
import { jobFind } from "./jobRepository";

export async function getFormData(jobId: string): Promise<RequiredFormDataType> {
  const job = await jobFind(jobId);
  return JSON.parse(job.formData);
}