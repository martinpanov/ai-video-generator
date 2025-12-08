import { apiFetch } from "../../utils/api";
import { STEPS } from "@/app/constants";
import { StepError } from "@/app/types";

export async function getSrtTranscript(srtUrl: string) {
  try {
    const data = await apiFetch({ endpoint: srtUrl, method: "GET", responseType: "text" });

    return data;
  } catch (error) {
    console.error('Failed fetching SRT transcript:', error);
    throw new StepError('Failed to fetch SRT transcript', STEPS.CLIP_VIDEO);
  }
}