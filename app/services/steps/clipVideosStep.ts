import { PROD_URL, STATUS } from '@/app/constants';
import { aiCommunication } from '@/app/lib/ai-communication';
import prisma from '@/app/lib/db';
import { getFormData } from '@/app/repositories/formRepository';
import { jobUpdate } from '@/app/repositories/jobRepository';
import { parseAiResponse } from '@/app/utils/parseAiResponse';
import { getSrtTranscript } from '../transcribeVideo/srt';
import { getWordTimestamps } from '../transcribeVideo/wordTimestamps';
import { clipVideo } from '../clipVideo/clipVideo';
import { timeToSeconds } from '@/app/utils/timeToSeconds';

type Clip = {
  clip: string;
  description: string;
  post: string;
  timeEnd: string;
  timeStart: string;
  title: string;
  status: string;
  clipUrl: string;
};

const toPublicUrl = (url: string) =>
  url?.replace('http://minio:9000', `${PROD_URL}/minio`);

async function identifyClips(job: any, previousStepData: any): Promise<Clip[]> {
  const srtData = await getSrtTranscript(toPublicUrl(previousStepData.response.srt_url), job.id);
  await getWordTimestamps(toPublicUrl(previousStepData.response.segments_url), job.id);

  const { videosAmount, videoDuration } = await getFormData(job.id);
  const data = await aiCommunication(videosAmount, videoDuration, srtData);
  const clips = parseAiResponse(data.content);

  return clips;
}

async function processClip(jobId: string, clip: Clip, allClips: Clip[], mediaUrl: string) {
  clip.status = STATUS.PROCESSING;

  await jobUpdate({
    jobId,
    step: 'aiClips',
    data: { clips: allClips }
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

export async function handleClipVideosStep(jobId: string, previousStepData: any) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error('Job not found');
  }

  const stepData = JSON.parse(job.stepData);
  const mediaUrl = stepData.download.response.media.media_url;

  if (!stepData.aiClips) {
    const clips = await identifyClips(job, previousStepData);
    await processClip(jobId, clips[0], clips, mediaUrl);
    return;
  }

  const clips: Clip[] = stepData.aiClips.clips;
  const clipUrl = previousStepData.response[0].file_url;

  // Find the clip that's currently processing (it just finished)
  const processingClip = clips.find((c) => c.status === STATUS.PROCESSING);

  if (processingClip) {
    // Update the clip with the URL and mark as completed
    processingClip.clipUrl = clipUrl;
    processingClip.status = STATUS.COMPLETED;

    await jobUpdate({
      jobId,
      step: 'aiClips',
      data: { clips }
    });
  }

  // Find next pending clip
  const nextPendingClip = clips.find((c) => c.status === STATUS.PENDING);

  if (nextPendingClip) {
    await processClip(jobId, nextPendingClip, clips, mediaUrl);
  }
  // If no more pending clips, the webhook handler will advance to next pipeline step
}
