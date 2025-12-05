import { generateTranscript } from '../transcribe/transcribe';
import { videoCreate, videoUpdate } from '@/app/repositories/videoRepository';
import { toPublicUrl } from '@/app/utils/toPublicUrl';
import { STEPS } from '@/app/constants';
import { jobFind } from '@/app/repositories/jobRepository';

export async function handleTranscribeStep(jobId: string, previousStepData: any) {
  if (previousStepData?.response?.media) {
    const job = await jobFind(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const mediaUrl = toPublicUrl(previousStepData.response.media.media_url);

    await videoCreate({
      jobId,
      userId: job.userId,
      data: {
        videoUrl: mediaUrl,
        videoWidth: previousStepData.response.media.width,
        videoHeight: previousStepData.response.media.height
      }
    });

    await generateTranscript(mediaUrl, jobId);
    return;
  }

  if (previousStepData?.response?.srt_url) {
    try {
      await videoUpdate({
        jobId,
        data: {
          srtUrl: toPublicUrl(previousStepData.response.srt_url),
          textUrl: toPublicUrl(previousStepData.response.text_url),
          segmentsUrl: toPublicUrl(previousStepData.response.segments_url)
        }
      });
    } catch (error) {
      console.error('Failed to save transcription data:', error);

      const err = new Error('Failed to process transcription');
      (err as any).step = STEPS.TRANSCRIBE;
      throw err;
    }
  }
}
