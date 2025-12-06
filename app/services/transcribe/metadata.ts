import { apiFetch } from "../../utils/api";
import { jobCreate, jobUpdate } from "../../repositories/jobRepository";
import { videoCreate } from "../../repositories/videoRepository";
import { FormDataType, RequiredFormDataType } from "@/app/types";
import { STEPS } from "@/app/constants";
import { PipelineType } from "@/generated/prisma/enums";

type Params = {
  formData: FormDataType;
  existingJobId?: string;
  userId: string;
  pipelineType?: PipelineType;
  videoUrl: string;
};

export async function generateMetadata({ formData, existingJobId, userId, pipelineType, videoUrl }: Params) {
  try {
    const data = await apiFetch({
      endpoint: "/v1/media/metadata",
      method: "POST",
      body: { media_url: videoUrl }
    });

    let job;

    if (existingJobId) {
      job = await jobUpdate({ jobId: existingJobId, step: STEPS.TRANSCRIBE, completedStep: "metadata" });
    } else {
      job = await jobCreate({
        step: STEPS.TRANSCRIBE,
        completedStep: "metadata",
        pipelineType: pipelineType as PipelineType,
        formData: formData as RequiredFormDataType,
        userId: userId as string
      });
    }

    await videoCreate({
      jobId: job.id,
      userId: userId as string,
      data: {
        videoUrl,
        videoWidth: data.response.width,
        videoHeight: data.response.height
      }
    });

    return job.id;
  } catch (error) {
    console.error('Failed to get metadata:', error);

    const err = new Error('Failed to get video metadata');
    (err as any).step = STEPS.TRANSCRIBE;
    throw err;
  }
}