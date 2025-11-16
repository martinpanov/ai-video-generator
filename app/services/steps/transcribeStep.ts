import { getMetadata } from '../transcribeVideo/metadata';
import { generateTranscript } from '../transcribeVideo/transcribe';

export async function handleTranscribeStep(jobId: string, previousStepData: any) {
  const mediaUrl = previousStepData.response.media.media_url;

  await getMetadata({ videoUrl: mediaUrl }, jobId);
  await generateTranscript(mediaUrl, jobId);
}
