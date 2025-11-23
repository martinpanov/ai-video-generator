import { STEPS } from '../constants';
import { handleTranscribeStep } from './steps/transcribeStep';
import { handleClipVideosStep } from './steps/clipVideosStep';
import { handleFinalizeClipsStep } from './steps/finalizeClipsStep';

export async function triggerNextStep(
  jobId: string,
  nextStep: { step: string; },
  previousStepData: any
) {
  console.log(`Triggering next step: ${nextStep.step} for job ${jobId}`);

  switch (nextStep.step) {
    case STEPS.TRANSCRIBE:
      await handleTranscribeStep(jobId, previousStepData);
      break;

    case STEPS.CLIP_VIDEOS:
      await handleClipVideosStep(jobId, previousStepData);
      break;

    case STEPS.FINALIZE_CLIPS:
      await handleFinalizeClipsStep(jobId);
      break;

    default:
      console.warn(`No handler for step: ${nextStep.step}`);
  }
}
