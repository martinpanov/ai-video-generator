import { STEPS, WEBHOOK_URL } from "@/app/constants";
import { apiFetch } from "../../utils/api";
import { jobCreate } from "@/app/repositories/jobRepository";
import { FormDataType, RequiredFormDataType } from "@/app/types";
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
      formData: config as RequiredFormDataType,
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

    const err = new Error('Failed to download video');
    (err as any).step = STEPS.DOWNLOAD;
    throw err;
  }
}