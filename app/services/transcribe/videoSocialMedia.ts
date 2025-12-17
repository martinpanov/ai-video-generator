import { STEPS, WEBHOOK_URL } from "@/app/constants";
import { apiFetch } from "../../utils/api";
import { jobCreate } from "@/app/repositories/jobRepository";
import { FormDataType, StepError } from "@/app/types";
import { PipelineType } from "@/generated/prisma/enums";

type Params = {
  config: FormDataType;
  userId: string;
  pipelineType: PipelineType;
};

export async function requestVideoSocialMediaLink({ config, userId, pipelineType }: Params) {
  try {
    const job = await jobCreate({
      step: STEPS.DOWNLOAD,
      pipelineType,
      formData: config,
      userId
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
    console.error('Failed to request link:', error);
    throw new StepError('Failed to download video', STEPS.DOWNLOAD);
  }
}