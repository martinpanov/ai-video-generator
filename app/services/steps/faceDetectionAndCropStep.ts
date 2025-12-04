import { STATUS, STEPS, WEBHOOK_URL } from "@/app/constants";
import { clipUpdate } from "@/app/repositories/clipRepository";
import { apiFetch } from "@/app/utils/api";
import { Clip } from "@/generated/prisma/client";
import { processClipsSequentially, resetClipsForNewStep } from "@/app/utils/clipProcessor";
import { cutAndScale } from "../calculateClipDimensions/cutAndScale";
import { toPublicUrl } from "@/app/utils/toPublicUrl";
import { calculateClipDimensions } from "@/app/utils/calculateClipDimensions";

function getMouthPosition(data: Record<string, any>) {
  const faceData = data.response.faceAnnotations[0];

  const mouthCenter = faceData.landmarks.find((lm: any) => lm.type === "MOUTH_CENTER");

  return {
    x: Math.round(mouthCenter.position.x),
    y: Math.round(mouthCenter.position.y),
    z: Math.round(mouthCenter.position.z)
  };
}

async function requestFaceCordinates(clip: Clip, jobId: string) {
  await clipUpdate({
    clipId: clip.id,
    data: { status: STATUS.PROCESSING },
    step: STEPS.FACE_DETECTION_AND_CROP
  });

  await apiFetch({
    endpoint: "/v1/video/detect-face",
    method: "POST",
    body: {
      video_url: clip.clipUrl,
      sample_frames: 100,
      webhook_url: `${WEBHOOK_URL}?jobId=${jobId}&step=${STEPS.FACE_DETECTION_AND_CROP}`
    }
  });
}

async function handleDimensionsResponse(processingClip: Clip, previousStepData: any, jobId: string) {
  const isFaceDetection = previousStepData?.response?.faceAnnotations;

  if (isFaceDetection) {
    const { x, y } = getMouthPosition(previousStepData);
    const { clipWidth, clipHeight, cropXWidth, cropYHeight, clipLeftXWidth, clipTopYHeight } = await calculateClipDimensions(jobId, x, y);

    await cutAndScale({
      clipUrl: processingClip.clipUrl!,
      clipWidth,
      clipHeight,
      cropXWidth,
      cropYHeight,
      clipLeftXWidth,
      clipTopYHeight,
      jobId,
      step: STEPS.FACE_DETECTION_AND_CROP
    });

    return;
  }

  const scaledClipUrl = toPublicUrl(previousStepData.response[0].file_url);

  await clipUpdate({
    clipId: processingClip.id,
    data: {
      clipUrl: scaledClipUrl,
      status: STATUS.COMPLETED
    },
    step: STEPS.FACE_DETECTION_AND_CROP
  });
}

export async function handleFaceDetectionAndCrop(jobId: string, previousStepData?: any) {
  await resetClipsForNewStep(jobId, STEPS.FACE_DETECTION_AND_CROP);

  await processClipsSequentially({
    jobId,
    step: STEPS.FACE_DETECTION_AND_CROP,
    previousStepData,
    processClipFn: requestFaceCordinates,
    handleResponseFn: handleDimensionsResponse,
    additionalArgs: [jobId]
  });
}


