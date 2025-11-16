import { jobUpdate } from "@/app/repositories/jobRepository";
import { apiFetch } from "../../utils/api";

export async function getWordTimestamps(segmentsUrl: string, jobId: string) {
  try {
    const data = await apiFetch({ endpoint: segmentsUrl, method: "GET", responseType: "text" });

    await jobUpdate({ jobId, step: "wordTimestamps", data });

    return data;
  } catch (error) {
    console.error('Failed fetching word timestamps:', error);

    const err = new Error('Failed to fetch word timestamps');
    (err as any).step = 'wordTimestamps';
    throw err;
  }
}