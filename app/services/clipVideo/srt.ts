import { jobUpdate } from "@/app/repositories/jobRepository";
import { apiFetch } from "../../utils/api";
import { STEPS } from "@/app/constants";

export async function getSrtTranscript(srtUrl: string, jobId: string) {
  try {
    const data = await apiFetch({ endpoint: srtUrl, method: "GET", responseType: "text" });

    await jobUpdate({ jobId, step: STEPS.CLIP_VIDEO, completedStep: "srtTranscript", data });

    return data;
  } catch (error) {
    console.error('Failed fetching SRT transcript:', error);

    const err = new Error('Failed to fetch SRT transcript');
    (err as any).step = STEPS.CLIP_VIDEO;
    throw err;
  }
}