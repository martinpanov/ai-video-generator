import { PROD_URL, STATUS } from '@/app/constants';
import { aiCommunication } from '@/app/lib/ai-communication';
import prisma from '@/app/lib/db';
import { getFormData } from '@/app/repositories/formRepository';
import { clipCreate, clipUpdate, clipFindByJob } from '@/app/repositories/clipRepository';
import { parseAiResponse } from '@/app/utils/parseAiResponse';
import { getSrtTranscript } from '../clipVideo/srt';
import { getWordTimestamps } from '../clipVideo/wordTimestamps';
import { clipVideo as clipVideoService } from '../clipVideo/clipVideo';
import { timeToSeconds } from '@/app/utils/timeToSeconds';
import { Clip } from '@prisma/client';
import { ClipData } from '@/app/types';
import { deleteVideo } from '../clipVideo/deleteVideo';

const toPublicUrl = (url: string) =>
  url?.replace('http://minio:9000', `${PROD_URL}/minio`);

async function identifyClips(jobId: string, previousStepData: any, userId: string | null) {
  const srtData = await getSrtTranscript(toPublicUrl(previousStepData.response.srt_url), jobId);
  await getWordTimestamps(toPublicUrl(previousStepData.response.segments_url), jobId);

  const { videosAmount, videoDuration } = await getFormData(jobId);
  const data = await aiCommunication(videosAmount, videoDuration, srtData);
  const clipsData: ClipData[] = parseAiResponse(data.content);

  await Promise.all(
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
    data: { status: STATUS.PROCESSING }
  });

  const startSeconds = timeToSeconds(clip.timeStart);
  const endSeconds = timeToSeconds(clip.timeEnd);
  const duration = endSeconds - startSeconds;

  await clipVideoService({
    timeStart: startSeconds,
    videoDuration: duration,
    videoUrl: mediaUrl,
    jobId
  });
}

export async function handleClipVideosStep(jobId: string, previousStepData: any) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error('Job not found');
  }

  const stepData = JSON.parse(job.stepData);
  const mediaUrl = toPublicUrl(stepData.download.response.media.media_url);

  let clips = await clipFindByJob(jobId);

  if (clips.length === 0) {
    await identifyClips(jobId, previousStepData, job.userId);

    clips = await clipFindByJob(jobId);
    await processClip(clips[0], mediaUrl, jobId);
    return;
  }

  const clipUrl = toPublicUrl(previousStepData.response[0].file_url);

  const processingClip = clips.find((c) => c.status === STATUS.PROCESSING);

  if (processingClip) {
    await clipUpdate({
      clipId: processingClip.id,
      data: {
        clipUrl,
        status: STATUS.COMPLETED
      }
    });
  }

  const nextPendingClip = clips.find((c) => c.status === STATUS.PENDING);

  if (nextPendingClip) {
    await processClip(nextPendingClip, mediaUrl, jobId);
    return;
  }

  await deleteVideo(mediaUrl);
}
