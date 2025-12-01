import { STATUS, STEPS, WEBHOOK_URL } from "@/app/constants";
import { clipUpdate } from "@/app/repositories/clipRepository";
import { getFormData } from "@/app/repositories/formRepository";
import { getMetadata } from "@/app/repositories/metadataRepository";
import { apiFetch } from "@/app/utils/api";
import { Clip } from "@/generated/prisma/client";
import { processClipsSequentially, resetClipsForNewStep } from "@/app/utils/clipProcessor";
import { cutAndScale } from "../calculateClipDimensions/cutAndScale";
import { toPublicUrl } from "@/app/utils/toPublicUrl";

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
    step: STEPS.CALCULATE_CLIP_DIMENSIONS
  });

  await apiFetch({
    endpoint: "/v1/video/detect-face",
    method: "POST",
    body: {
      video_url: clip.clipUrl,
      sample_frames: 100,
      webhook_url: `${WEBHOOK_URL}?jobId=${jobId}&step=${STEPS.CALCULATE_CLIP_DIMENSIONS}`
    }
  });
}

async function handleDimensionsResponse(processingClip: Clip, previousStepData: any, jobId: string) {
  const isFaceDetection = previousStepData?.response?.faceAnnotations;

  if (isFaceDetection) {
    const { x, y } = getMouthPosition(previousStepData);
    const metadata = await getMetadata(jobId);
    const formData = await getFormData(jobId);

    const videoWidth = Number(metadata.response.width);
    const videoHeight = Number(metadata.response.height);

    const clipWidth = Number(formData.clipSize.split("x")[0]);
    const clipHeight = Number(formData.clipSize.split("x")[1]);

    const videoAspectRatio = videoWidth / videoHeight;
    const clipAspectRatio = clipWidth / clipHeight;

    const cropXWidth = Math.ceil(videoAspectRatio > clipAspectRatio ? videoHeight * clipAspectRatio : videoWidth);
    const cropYHeight = Math.ceil(videoAspectRatio > clipAspectRatio ? videoHeight : videoWidth / clipAspectRatio);
    const clipLeftXWidth = Math.ceil(Math.max(0, x - (cropXWidth / 2)));
    const clipTopYHeight = Math.ceil(Math.max(0, y - (cropYHeight / 2)));

    await cutAndScale({
      clipUrl: processingClip.clipUrl!,
      clipWidth,
      clipHeight,
      cropXWidth,
      cropYHeight,
      clipLeftXWidth,
      clipTopYHeight,
      jobId
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
    step: STEPS.CALCULATE_CLIP_DIMENSIONS
  });
}

export async function handleClipDimensions(jobId: string, previousStepData?: any) {
  await resetClipsForNewStep(jobId, STEPS.CALCULATE_CLIP_DIMENSIONS);

  await processClipsSequentially({
    jobId,
    step: STEPS.CALCULATE_CLIP_DIMENSIONS,
    previousStepData,
    processClipFn: requestFaceCordinates,
    handleResponseFn: handleDimensionsResponse,
    additionalArgs: [jobId]
  });
}


