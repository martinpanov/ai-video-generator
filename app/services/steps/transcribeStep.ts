import { generateTranscript } from '../transcribe/transcribe';
import { toPublicUrl } from '@/app/utils/toPublicUrl';
import { jobFind } from '@/app/repositories/jobRepository';
import { generateMetadata } from '../transcribe/metadata';

export async function handleTranscribeStep(jobId: string, previousStepData: any) {
  const job = await jobFind(jobId);
  const { formData, userId } = job;
  const mediaUrl = toPublicUrl(previousStepData.response.media.media_url);

  await generateMetadata({ formData: JSON.parse(formData), existingJobId: jobId, userId, videoUrl: mediaUrl });
  await generateTranscript(mediaUrl, jobId);
}
