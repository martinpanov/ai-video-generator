import { STATUS, STEPS } from "@/app/constants";
import { clipCreate, clipFindByJob, clipUpdate } from "@/app/repositories/clipRepository";
import { processClipsSequentially, resetClipsForNewStep } from "@/app/utils/clipProcessor";
import { toPublicUrl } from "@/app/utils/toPublicUrl";
import { Clip } from "@/generated/prisma/client";
import { cutAndScale } from "../calculateClipDimensions/cutAndScale";
import { calculateClipDimensions } from "@/app/utils/calculateClipDimensions";
import { timeToSeconds } from "@/app/utils/timeToSeconds";
import { videoFindByJob, videoUpdate } from "@/app/repositories/videoRepository";
import { jobFind } from "@/app/repositories/jobRepository";
import { getSrtTranscript } from "../clipVideo/srt";
import { aiCommunication } from "@/app/lib/ai-communication";
import { parseAiResponse } from "@/app/utils/parseAiResponse";
import { ClipData } from "@/app/types";
import { getFormData } from "@/app/repositories/formRepository";

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

async function identifyClips(jobId: string, previousStepData: TranscribeResponseData, userId: string) {
  await videoUpdate({
    jobId,
    data: {
      srtUrl: toPublicUrl(previousStepData.response.srt_url),
      textUrl: toPublicUrl(previousStepData.response.text_url),
      segmentsUrl: toPublicUrl(previousStepData.response.segments_url)
    }
  });

  const srtData = await getSrtTranscript(toPublicUrl(previousStepData.response.srt_url));
  const { videosAmount, videoDuration, splitVideo, videoUrl, durationType } = await getFormData(jobId);
  const data = await aiCommunication({ videosAmount, videoDuration, splitVideo, srtData, durationType });
  const clipsData: ClipData[] = parseAiResponse(data.content);

  return Promise.all(
    clipsData.map((clipData) =>
      clipCreate({
        clipData,
        videoUrl,
        jobId,
        userId
      })
    )
  );
}

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

async function handleDimensionsResponse(processingClip: Clip, previousStepData: TranscribeResponseData | CropVideoStepData) {
  const clipData = previousStepData as CropVideoStepData;
  const clipUrl = toPublicUrl(clipData.response[0].file_url);
  const thumbnailUrl = toPublicUrl(clipData.response[0].thumbnail_url);

  await clipUpdate({
    clipId: processingClip.id,
    data: {
      clipUrl,
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
    await identifyClips(jobId, previousStepData as TranscribeResponseData, job.userId);
  }

  await resetClipsForNewStep(jobId, STEPS.CROP_VIDEO);

  await processClipsSequentially({
    jobId,
    step: STEPS.CROP_VIDEO,
    previousStepData: previousStepData as TranscribeResponseData | CropVideoStepData,
    processClipFn: requestCropVideo,
    handleResponseFn: handleDimensionsResponse,
    additionalArgs: [jobId]
  });
}