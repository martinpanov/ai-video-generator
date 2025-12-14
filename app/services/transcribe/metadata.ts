import { apiFetch } from "../../utils/api";
import { jobCreate, jobUpdate } from "../../repositories/jobRepository";
import { videoCreate } from "../../repositories/videoRepository";
import { FormDataType, StepError } from "@/app/types";
import { STEPS } from "@/app/constants";
import { PipelineType } from "@/generated/prisma/enums";
import { toPublicUrl } from "@/app/utils/toPublicUrl";

type Params = {
  formData: FormDataType;
  existingJobId?: string;
  userId: string;
  pipelineType?: PipelineType;
  videoUrl: string;
};

export async function generateMetadata({ formData, existingJobId, userId, pipelineType, videoUrl }: Params) {
  try {
    // Use forBackend=true to keep minio:9000 for Docker containers
    const backendUrl = toPublicUrl(videoUrl, true);

    const data = await apiFetch({
      endpoint: "/v1/media/metadata",
      method: "POST",
      body: { media_url: backendUrl }
    });

    let job;

    if (existingJobId) {
      job = await jobUpdate({ jobId: existingJobId, step: STEPS.TRANSCRIBE, completedStep: "metadata" });
    } else {
      job = await jobCreate({
        step: STEPS.TRANSCRIBE,
        completedStep: "metadata",
        pipelineType: pipelineType as PipelineType,
        formData: formData,
        userId
      });
    }

    await videoCreate({
      jobId: job.id,
      userId,
      data: {
        videoUrl,
        videoWidth: data.response.width,
        videoHeight: data.response.height
      }
    });

    return job.id;
  } catch (error) {
    console.error('Failed to get metadata:', error);
    throw new StepError('Failed to get video metadata', STEPS.TRANSCRIBE);
  }
}