import { apiFetch } from "../../utils/api";
import { STEPS } from "@/app/constants";

export async function getSrtTranscript(srtUrl: string) {
  try {
    const data = await apiFetch({ endpoint: srtUrl, method: "GET", responseType: "text" });

    return data;
  } catch (error) {
    console.error('Failed fetching SRT transcript:', error);

    const err = new Error('Failed to fetch SRT transcript');
    (err as any).step = STEPS.CLIP_VIDEO;
    throw err;
  }
}