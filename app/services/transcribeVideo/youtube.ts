import { STEPS, WEBHOOK_URL } from "@/app/constants";
import { apiFetch } from "../../utils/api";
import { jobCreate } from "@/app/repositories/jobRepository";
import { Config, RequiredConfig } from "@/app/types";

export async function requestYoutubeLink(config: Config) {
  try {
    const job = await jobCreate({
      data: { originalUrl: config.videoUrl },
      step: STEPS.DOWNLOAD,
      pipelineType: "youtube",
      formData: config as RequiredConfig
    });

    const payload = {
      media_url: config.videoUrl,
      cloud_upload: true,
      cookie: "/tmp/cookies.txt",
      webhook_url: `${WEBHOOK_URL}?jobId=${job.id}&step=${STEPS.DOWNLOAD}`
    };

    await apiFetch({ endpoint: "/v1/BETA/media/download", method: "POST", body: payload });

    return job.id;
  } catch (error) {
    console.error('Failed to request YouTube link:', error);

    const err = new Error('Failed to download YouTube video');
    (err as any).step = STEPS.DOWNLOAD;
    throw err;
  }
}