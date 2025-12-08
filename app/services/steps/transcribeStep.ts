import { generateTranscript } from '../transcribe/transcribe';
import { toPublicUrl } from '@/app/utils/toPublicUrl';
import { jobFind } from '@/app/repositories/jobRepository';
import { generateMetadata } from '../transcribe/metadata';

type TranscribeStepData = {
  response: {
    media: {
      media_url: string;
    };
  };
};

export async function handleTranscribeStep(jobId: string, previousStepData: Record<string, unknown>) {
  const data = previousStepData as TranscribeStepData;
  const job = await jobFind(jobId);
  const { formData, userId } = job;
  const mediaUrl = toPublicUrl(data.response.media.media_url);

  await generateMetadata({ formData: JSON.parse(formData), existingJobId: jobId, userId, videoUrl: mediaUrl });
  await generateTranscript(mediaUrl, jobId);
}
