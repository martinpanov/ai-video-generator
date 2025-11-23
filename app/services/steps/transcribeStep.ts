import { generateMetadata } from '../transcribeVideo/metadata';
import { generateTranscript } from '../transcribeVideo/transcribe';

export async function handleTranscribeStep(jobId: string, previousStepData: any) {
  const mediaUrl = previousStepData.response.media.media_url;

  await generateMetadata({ config: { videoUrl: mediaUrl }, existingJobId: jobId });
  await generateTranscript(mediaUrl, jobId);
}
