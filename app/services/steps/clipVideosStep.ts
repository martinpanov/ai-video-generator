import { STATUS, STEPS } from '@/app/constants';
import { aiCommunication } from '@/app/lib/ai-communication';
import { getFormData } from '@/app/repositories/formRepository';
import { clipCreate, clipUpdate, clipFindByJob } from '@/app/repositories/clipRepository';
import { parseAiResponse } from '@/app/utils/parseAiResponse';
import { getSrtTranscript } from '../clipVideo/srt';
import { getWordTimestamps } from '../clipVideo/wordTimestamps';
import { clipVideo } from '../clipVideo/clipVideo';
import { timeToSeconds } from '@/app/utils/timeToSeconds';
import { Clip } from '@/generated/prisma/client';
import { ClipData } from '@/app/types';
import { deleteVideo } from '../clipVideo/deleteVideo';
import { jobFind } from '@/app/repositories/jobRepository';
import { processClipsSequentially } from '@/app/utils/clipProcessor';
import { toPublicUrl } from '@/app/utils/toPublicUrl';

async function identifyClips(jobId: string, previousStepData: any, userId: string) {
  const srtData = await getSrtTranscript(toPublicUrl(previousStepData.response.srt_url), jobId);
  // await getWordTimestamps(toPublicUrl(previousStepData.response.segments_url), jobId);

  const { videosAmount, videoDuration, splitVideo } = await getFormData(jobId);
  const data = await aiCommunication({ videosAmount, videoDuration, splitVideo, srtData });
  const clipsData: ClipData[] = parseAiResponse(data.content);

  return Promise.all(
    clipsData.map((clipData) =>
      clipCreate({
        clipData,
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

async function handleClipResponse(processingClip: Clip, previousStepData: any) {
  const clipUrl = toPublicUrl(previousStepData.response[0].file_url);
  const thumbnailUrl = toPublicUrl(previousStepData.response[0].thumbnail_url);

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

export async function handleClipVideosStep(jobId: string, previousStepData: any) {
  const job = await jobFind(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const stepData = JSON.parse(job.stepData);
  const mediaUrl = toPublicUrl(stepData.download.response.media.media_url);

  const clips = await clipFindByJob(jobId);

  if (clips.length === 0) {
    await identifyClips(jobId, previousStepData, job.userId);
  }

  await processClipsSequentially({
    jobId,
    step: STEPS.CLIP_VIDEO,
    previousStepData,
    processClipFn: processClip,
    handleResponseFn: handleClipResponse,
    additionalArgs: [mediaUrl, jobId]
  });

  // await deleteVideo(mediaUrl);
}
