import { FormDataType } from "../types";
import { jobFind } from "./jobRepository";

export async function getFormData(jobId: string): Promise<FormDataType> {
  const job = await jobFind(jobId);
  return JSON.parse(job.formData);
}