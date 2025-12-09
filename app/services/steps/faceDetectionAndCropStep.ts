import { STATUS, STEPS, WEBHOOK_URL } from "@/app/constants";
import { clipUpdate, clipFindByJob } from "@/app/repositories/clipRepository";
import { apiFetch } from "@/app/utils/api";
import { Clip } from "@/generated/prisma/client";
import { processClipsInParallel, resetClipsForNewStep } from "@/app/utils/clipProcessor";
import { cutAndScale } from "../calculateClipDimensions/cutAndScale";
import { toPublicUrl } from "@/app/utils/toPublicUrl";
import { calculateClipDimensions } from "@/app/utils/calculateClipDimensions";
import { timeToSeconds } from "@/app/utils/timeToSeconds";
import { videoFindByJob } from "@/app/repositories/videoRepository";
import { jobFind } from "@/app/repositories/jobRepository";
import { identifyClips } from "../clips/identifyClips";

type TranscribeResponseData = {
  response: {
    srt_url: string;
    text_url: string;
    segments_url: string;
  };
};

type FaceDetectionStepData = {
  response: {
    faceAnnotations: Array<{
      landmarks: Array<{
        type: string;
        position: {
          x: number;
          y: number;
          z: number;
        };
      }>;
    }>;
  };
};

type CropVideoStepData = {
  response: Array<{
    file_url: string;
    thumbnail_url: string;
  }>;
};

function getMouthPosition(data: FaceDetectionStepData) {
  const faceData = data.response.faceAnnotations[0];

  const mouthCenter = faceData.landmarks.find((lm) => lm.type === "MOUTH_CENTER")!;

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
      webhook_url: `${WEBHOOK_URL}?jobId=${jobId}&step=${STEPS.FACE_DETECTION_AND_CROP}&clipId=${clip.id}`
    }
  });
}

async function handleDimensionsResponse(processingClip: Clip, previousStepData: FaceDetectionStepData | CropVideoStepData, jobId: string) {
  const isFaceDetection = 'faceAnnotations' in previousStepData.response;

  if (isFaceDetection) {
    const { x, y } = getMouthPosition(previousStepData as FaceDetectionStepData);
    const { clipWidth, clipHeight, cropXWidth, cropYHeight, clipLeftXWidth, clipTopYHeight } = await calculateClipDimensions(jobId, x, y);

    const video = await videoFindByJob(jobId);
    const startSeconds = timeToSeconds(processingClip.timeStart);
    const endSeconds = timeToSeconds(processingClip.timeEnd);
    const duration = endSeconds - startSeconds;

    await cutAndScale({
      clipUrl: video.videoUrl,
      clipWidth,
      clipHeight,
      cropXWidth,
      cropYHeight,
      clipLeftXWidth,
      clipTopYHeight,
      jobId,
      step: STEPS.FACE_DETECTION_AND_CROP,
      clipId: processingClip.id,
      timeStart: startSeconds,
      videoDuration: duration
    });

    return;
  }

  const cropData = previousStepData as CropVideoStepData;
  const scaledClipUrl = toPublicUrl(cropData.response[0].file_url);
  const thumbnailUrl = toPublicUrl(cropData.response[0].thumbnail_url);

  await clipUpdate({
    clipId: processingClip.id,
    data: {
      clipUrl: scaledClipUrl,
      thumbnailUrl,
      status: STATUS.COMPLETED
    },
    step: STEPS.FACE_DETECTION_AND_CROP
  });
}

export async function handleFaceDetectionAndCrop(jobId: string, previousStepData?: Record<string, unknown>) {
  const job = await jobFind(jobId);
  const clips = await clipFindByJob(jobId);

  if (clips.length === 0) {
    await identifyClips(jobId, previousStepData as TranscribeResponseData, job.userId, STEPS.FACE_DETECTION_AND_CROP);
  }

  await resetClipsForNewStep(jobId, STEPS.FACE_DETECTION_AND_CROP);

  await processClipsInParallel({
    jobId,
    step: STEPS.FACE_DETECTION_AND_CROP,
    previousStepData: previousStepData as any,
    processClipFn: requestFaceCordinates,
    handleResponseFn: handleDimensionsResponse,
    additionalArgs: [jobId]
  }, 2); // Process 2 clips at a time
}


