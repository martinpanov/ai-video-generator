import { generateMetadata } from '../transcribe/metadata';
import { generateTranscript } from '../transcribe/transcribe';

export async function handleTranscribeStep(jobId: string, previousStepData: any) {
  const mediaUrl = previousStepData.response.media.media_url;

  await generateMetadata({ config: { videoUrl: mediaUrl }, existingJobId: jobId });
  await generateTranscript(mediaUrl, jobId);
}
