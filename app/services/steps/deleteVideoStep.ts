import { jobFind } from "@/app/repositories/jobRepository";
import { toPublicUrl } from "@/app/utils/toPublicUrl";
import { STEPS } from "@/app/constants";
import { apiFetch } from "@/app/utils/api";

export async function handleDeleteVideo(jobId: string) {
  try {
    const job = await jobFind(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const stepData = JSON.parse(job.stepData);
    const mediaUrl = toPublicUrl(stepData.download.response.media.media_url);

    apiFetch({ endpoint: "/v1/s3/delete", method: "POST", body: mediaUrl });
  } catch (error) {
    console.error('Failed to delete video:', error);

    const err = new Error('Failed to delete video');
    (err as any).step = STEPS.DELETE_VIDEO;
    throw err;
  }
}