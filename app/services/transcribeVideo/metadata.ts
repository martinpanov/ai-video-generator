import { apiFetch } from "../../utils/api";
import { jobCreate, jobUpdate } from "../../repositories/jobRepository";
import { Config, RequiredConfig } from "@/app/types";

export async function getMetadata(config: Config, existingJobId?: string) {
  try {
    const data = await apiFetch({
      endpoint: "/v1/media/metadata",
      method: "POST",
      body: { media_url: config.videoUrl }
    });

    if (existingJobId) {
      const job = await jobUpdate({ jobId: existingJobId, step: "metaData", data });
      return job.id;
    }

    const job = await jobCreate({
      data,
      step: "metaData",
      pipelineType: "direct",
      formData: config as RequiredConfig
    });

    return job.id;
  } catch (error) {
    console.error('Failed to get metadata:', error);

    const err = new Error('Failed to get video metadata');
    (err as any).step = 'metadata';
    throw err;
  }
}