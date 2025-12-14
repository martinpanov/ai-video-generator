import { generateTranscript } from '../transcribe/transcribe';
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
  // Keep the original minio:9000 URL for database storage
  const mediaUrl = data.response.media.media_url;

  await generateMetadata({ formData: JSON.parse(formData), existingJobId: jobId, userId, videoUrl: mediaUrl });
  await generateTranscript(mediaUrl, jobId);
}
