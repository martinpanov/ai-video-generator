import { prisma } from '../lib/db';
import { STATUS, STEPS } from '../constants';
import { PIPELINES } from '../pipeline';
import { jobFind, jobUpdate } from '../repositories/jobRepository';
import { handleTranscribeStep } from './steps/transcribeStep';
import { handleFaceDetectionAndCrop } from './steps/faceDetectionAndCropStep';
import { handleCaption } from './steps/captionClipStep';
import { handleCropVideo } from './steps/cropVideoStep';
import { handleDeleteVideo } from './steps/deleteVideoStep';

class JobQueue {
  async completeStep<T extends Record<string, unknown>>(jobId: string, step: string, data: T, clipId?: string) {
    const remainOnSameStep = [STEPS.FACE_DETECTION_AND_CROP, STEPS.CROP_VIDEO, STEPS.CAPTION_CLIP]
      .some(repeatingStep => repeatingStep === step) && data?.response;

    if (remainOnSameStep) {
      await this.triggerNextStep(jobId, step, data, clipId);
      return;
    }

    await jobUpdate({ jobId, step, completedStep: step });

    await this.progressToNextStep(jobId, data);
  }

  private async triggerNextStep<T extends Record<string, unknown>>(jobId: string, step: string, previousStepData: T, clipId?: string) {
    console.log(`Triggering next step: ${step} for job ${jobId}${clipId ? ` clip ${clipId}` : ''}`);

    const dataWithClipId = clipId ? { ...previousStepData, clipId } : previousStepData;

    switch (step) {
      case STEPS.TRANSCRIBE:
        await handleTranscribeStep(jobId, dataWithClipId);
        break;

      case STEPS.CROP_VIDEO:
        await handleCropVideo(jobId, dataWithClipId);
        break;

      case STEPS.FACE_DETECTION_AND_CROP:
        await handleFaceDetectionAndCrop(jobId, dataWithClipId);
        break;

      case STEPS.CAPTION_CLIP:
        await handleCaption(jobId, dataWithClipId);
        break;

      case STEPS.DELETE_VIDEO:
        await handleDeleteVideo(jobId);
    }
  }

  private async progressToNextStep<T extends Record<string, unknown>>(jobId: string, previousStepData: T) {
    const job = await jobFind(jobId);
    const pipeline = PIPELINES[job.pipelineType];
    const completedSteps = JSON.parse(job.completedSteps);

    const nextStep = pipeline.find(s => !completedSteps.includes(s.step));

    if (!nextStep) {
      await prisma.job.update({
        where: { id: jobId },
        data: { status: STATUS.COMPLETED }
      });
      return;
    }

    const isDeleteStep = nextStep.step === STEPS.DELETE_VIDEO;

    await prisma.job.update({
      where: { id: jobId },
      data: {
        currentStep: nextStep.step,
        ...(isDeleteStep && { status: STATUS.COMPLETED })
      }
    });

    await this.triggerNextStep(jobId, nextStep.step, previousStepData);
  }
}

export const jobQueue = new JobQueue();
