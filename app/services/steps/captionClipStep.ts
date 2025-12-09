import { processClipsInParallel, resetClipsForNewStep } from "@/app/utils/clipProcessor";
import { captionVideo } from "../captionClip/captionClip";
import { STATUS, STEPS } from "@/app/constants";
import { Clip } from "@/generated/prisma/client";
import { clipUpdate } from "@/app/repositories/clipRepository";
import { toPublicUrl } from "@/app/utils/toPublicUrl";

type CaptionClipStepData = {
  response: {
    file_url: string;
  };
};

async function processClip(clip: Clip, jobId: string) {
  await clipUpdate({
    clipId: clip.id,
    data: { status: STATUS.PROCESSING },
    step: STEPS.CAPTION_CLIP
  });

  await captionVideo(clip, jobId);
}

async function handleClipResponse(processingClip: Clip, previousStepData: CaptionClipStepData) {
  const clipUrl = toPublicUrl(previousStepData.response.file_url);

  await clipUpdate({
    clipId: processingClip.id,
    data: {
      clipUrl,
      status: STATUS.COMPLETED
    },
    step: STEPS.CAPTION_CLIP
  });
}

export async function handleCaption(jobId: string, previousStepData?: Record<string, unknown>) {
  await resetClipsForNewStep(jobId, STEPS.CAPTION_CLIP);

  await processClipsInParallel({
    jobId,
    step: STEPS.CAPTION_CLIP,
    previousStepData: previousStepData as CaptionClipStepData,
    processClipFn: processClip,
    handleResponseFn: handleClipResponse,
    additionalArgs: [jobId]
  }, 2); // Process 2 clips at a time
}