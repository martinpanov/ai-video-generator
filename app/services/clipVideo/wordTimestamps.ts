import { jobUpdate } from "@/app/repositories/jobRepository";
import { apiFetch } from "../../utils/api";
import { STEPS } from "@/app/constants";
import { StepError } from "@/app/types";

export async function getWordTimestamps(segmentsUrl: string, jobId: string) {
  try {
    const data = await apiFetch({ endpoint: segmentsUrl, method: "GET", responseType: "text" });

    await jobUpdate({ jobId, step: STEPS.CLIP_VIDEO, completedStep: "wordTimestamps" });

    return data;
  } catch (error) {
    console.error('Failed fetching word timestamps:', error);
    throw new StepError('Failed to fetch word timestamps', STEPS.CLIP_VIDEO);
  }
}