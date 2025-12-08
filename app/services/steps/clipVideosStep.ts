import { STATUS, STEPS } from '@/app/constants';
import { aiCommunication } from '@/app/lib/ai-communication';
import { getFormData } from '@/app/repositories/formRepository';
import { clipCreate, clipUpdate, clipFindByJob } from '@/app/repositories/clipRepository';
import { parseAiResponse } from '@/app/utils/parseAiResponse';
import { getSrtTranscript } from '../clipVideo/srt';
import { clipVideo } from '../clipVideo/clipVideo';
import { timeToSeconds } from '@/app/utils/timeToSeconds';
import { Clip } from '@/generated/prisma/client';
import { ClipData } from '@/app/types';
import { jobFind } from '@/app/repositories/jobRepository';
import { videoFindByJob, videoUpdate } from '@/app/repositories/videoRepository';
import { processClipsSequentially } from '@/app/utils/clipProcessor';
import { toPublicUrl } from '@/app/utils/toPublicUrl';

type TranscribeResponseData = {
  response: {
    srt_url: string;
    text_url: string;
    segments_url: string;
  };
};

type ClipVideoResponseData = {
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
  // await getWordTimestamps(toPublicUrl(previousStepData.response.segments_url), jobId);
  const { videosAmount, videoDuration, splitVideo, videoUrl } = await getFormData(jobId);
  const data = await aiCommunication({ videosAmount, videoDuration, splitVideo, srtData });
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

async function processClip(clip: Clip, mediaUrl: string, jobId: string) {
  await clipUpdate({
    clipId: clip.id,
    data: { status: STATUS.PROCESSING },
    step: STEPS.CLIP_VIDEO
  });

  const startSeconds = timeToSeconds(clip.timeStart);
  const endSeconds = timeToSeconds(clip.timeEnd);
  const duration = endSeconds - startSeconds;

  await clipVideo({
    timeStart: startSeconds,
    videoDuration: duration,
    videoUrl: mediaUrl,
    jobId
  });
}

async function handleClipResponse(processingClip: Clip, previousStepData: TranscribeResponseData | ClipVideoResponseData) {
  const clipData = previousStepData as ClipVideoResponseData;
  const clipUrl = toPublicUrl(clipData.response[0].file_url);
  const thumbnailUrl = toPublicUrl(clipData.response[0].thumbnail_url);

  await clipUpdate({
    clipId: processingClip.id,
    data: {
      clipUrl,
      thumbnailUrl,
      status: STATUS.COMPLETED
    },
    step: STEPS.CLIP_VIDEO
  });
}

export async function handleClipVideosStep(jobId: string, previousStepData: Record<string, unknown>) {
  const job = await jobFind(jobId);
  const video = await videoFindByJob(jobId);
  const clips = await clipFindByJob(jobId);

  if (clips.length === 0) {
    await identifyClips(jobId, previousStepData as TranscribeResponseData, job.userId);
  }

  await processClipsSequentially({
    jobId,
    step: STEPS.CLIP_VIDEO,
    previousStepData: previousStepData as TranscribeResponseData | ClipVideoResponseData,
    processClipFn: processClip,
    handleResponseFn: handleClipResponse,
    additionalArgs: [video.videoUrl, jobId]
  });
}
