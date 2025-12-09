import { STATUS, STEPS } from "@/app/constants";
import { clipUpdate, clipFindByJob } from "@/app/repositories/clipRepository";
import { processClipsInParallel, resetClipsForNewStep } from "@/app/utils/clipProcessor";
import { toPublicUrl } from "@/app/utils/toPublicUrl";
import { Clip } from "@/generated/prisma/client";
import { cutAndScale } from "../calculateClipDimensions/cutAndScale";
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

type CropVideoStepData = {
  response: Array<{
    file_url: string;
    thumbnail_url: string;
  }>;
};

async function requestCropVideo(processingClip: Clip, jobId: string) {
  await clipUpdate({
    clipId: processingClip.id,
    data: { status: STATUS.PROCESSING },
    step: STEPS.CROP_VIDEO
  });

  const { clipWidth, clipHeight, cropXWidth, cropYHeight } = await calculateClipDimensions(jobId);

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
    jobId,
    step: STEPS.CROP_VIDEO,
    clipId: processingClip.id,
    timeStart: startSeconds,
    videoDuration: duration
  });
}

async function handleDimensionsResponse(processingClip: Clip, previousStepData: CropVideoStepData) {
  const scaledClipUrl = toPublicUrl(previousStepData.response[0].file_url);
  const thumbnailUrl = toPublicUrl(previousStepData.response[0].thumbnail_url);

  await clipUpdate({
    clipId: processingClip.id,
    data: {
      clipUrl: scaledClipUrl,
      thumbnailUrl,
      status: STATUS.COMPLETED
    },
    step: STEPS.CROP_VIDEO
  });
}

export async function handleCropVideo(jobId: string, previousStepData?: Record<string, unknown>) {
  const job = await jobFind(jobId);
  const clips = await clipFindByJob(jobId);

  if (clips.length === 0) {
    await identifyClips(jobId, previousStepData as TranscribeResponseData, job.userId, STEPS.CROP_VIDEO);
  }

  await resetClipsForNewStep(jobId, STEPS.CROP_VIDEO);

  await processClipsInParallel({
    jobId,
    step: STEPS.CROP_VIDEO,
    previousStepData: previousStepData as any,
    processClipFn: requestCropVideo,
    handleResponseFn: handleDimensionsResponse,
    additionalArgs: [jobId]
  }, 2); // Process 2 clips at a time
}