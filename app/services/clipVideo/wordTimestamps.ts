import { jobUpdate } from "@/app/repositories/jobRepository";
import { apiFetch } from "../../utils/api";
import { STEPS } from "@/app/constants";

export async function getWordTimestamps(segmentsUrl: string, jobId: string) {
  try {
    const data = await apiFetch({ endpoint: segmentsUrl, method: "GET", responseType: "text" });

    await jobUpdate({ jobId, step: STEPS.CLIP_VIDEOS, completedStep: "wordTimestamps", data });

    return data;
  } catch (error) {
    console.error('Failed fetching word timestamps:', error);

    const err = new Error('Failed to fetch word timestamps');
    (err as any).step = STEPS.CLIP_VIDEOS;
    throw err;
  }
}