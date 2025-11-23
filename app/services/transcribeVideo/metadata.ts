import { apiFetch } from "../../utils/api";
import { jobCreate, jobUpdate } from "../../repositories/jobRepository";
import { Config, RequiredConfig } from "@/app/types";
import { STEPS } from "@/app/constants";

type Params = {
  config: Config;
  existingJobId?: string;
  userId?: string | null;
};

export async function generateMetadata({ config, existingJobId, userId = null }: Params) {
  try {
    const data = await apiFetch({
      endpoint: "/v1/media/metadata",
      method: "POST",
      body: { media_url: config.videoUrl }
    });

    if (existingJobId) {
      const job = await jobUpdate({ jobId: existingJobId, step: STEPS.TRANSCRIBE, completedStep: "metaData", data });
      return job.id;
    }

    const job = await jobCreate({
      data,
      step: "metaData",
      pipelineType: "direct",
      formData: config as RequiredConfig,
      userId
    });

    return job.id;
  } catch (error) {
    console.error('Failed to get metadata:', error);

    const err = new Error('Failed to get video metadata');
    (err as any).step = STEPS.TRANSCRIBE;
    throw err;
  }
}