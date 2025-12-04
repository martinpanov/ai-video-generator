import { STATUS, STEPS } from "@/app/constants";
import { clipUpdate } from "@/app/repositories/clipRepository";
import { processClipsSequentially, resetClipsForNewStep } from "@/app/utils/clipProcessor";
import { toPublicUrl } from "@/app/utils/toPublicUrl";
import { Clip } from "@/generated/prisma/client";
import { cutAndScale } from "../calculateClipDimensions/cutAndScale";
import { calculateClipDimensions } from "@/app/utils/calculateClipDimensions";

async function requestCropVideo(processingClip: Clip, jobId: string) {
  await clipUpdate({
    clipId: processingClip.id,
    data: { status: STATUS.PROCESSING },
    step: STEPS.CROP_VIDEO
  });

  const { clipWidth, clipHeight, cropXWidth, cropYHeight } = await calculateClipDimensions(jobId);

  await cutAndScale({
    clipUrl: processingClip.clipUrl!,
    clipWidth,
    clipHeight,
    cropXWidth,
    cropYHeight,
    jobId,
    step: STEPS.CROP_VIDEO
  });
}

async function handleDimensionsResponse(processingClip: Clip, previousStepData: any) {
  const scaledClipUrl = toPublicUrl(previousStepData.response[0].file_url);

  await clipUpdate({
    clipId: processingClip.id,
    data: {
      clipUrl: scaledClipUrl,
      status: STATUS.COMPLETED
    },
    step: STEPS.CROP_VIDEO
  });
}

export async function handleCropVideo(jobId: string, previousStepData?: any) {
  await resetClipsForNewStep(jobId, STEPS.CROP_VIDEO);

  await processClipsSequentially({
    jobId,
    step: STEPS.CROP_VIDEO,
    previousStepData,
    processClipFn: requestCropVideo,
    handleResponseFn: handleDimensionsResponse,
    additionalArgs: [jobId]
  });
}