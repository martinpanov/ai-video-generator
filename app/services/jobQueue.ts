import { prisma } from '../lib/db';
import { PIPELINES, STATUS, STEPS } from '../constants';
import { jobFind, jobUpdate } from '../repositories/jobRepository';
import { handleTranscribeStep } from './steps/transcribeStep';
import { handleClipVideosStep } from './steps/clipVideosStep';
import { handleFaceDetectionAndCrop } from './steps/faceDetectionAndCropStep';
import { handleCaption } from './steps/captionClipStep';
import { handleCropVideo } from './steps/cropVideoStep';
import { handleDeleteVideo } from './steps/deleteVideoStep';

class JobQueue {
  async completeStep(jobId: string, step: string, data: any) {
    const remainOnSameStep = [STEPS.CLIP_VIDEO, STEPS.FACE_DETECTION_AND_CROP, STEPS.CROP_VIDEO, STEPS.CAPTION_CLIP]
      .some(repeatingStep => repeatingStep === step) && data?.response;

    if (remainOnSameStep) {
      await this.triggerNextStep(jobId, step, data);
      return;
    }

    await jobUpdate({ jobId, step, completedStep: step });

    await this.progressToNextStep(jobId, data);
  }

  private async triggerNextStep(jobId: string, step: string, previousStepData: any) {
    console.log(`Triggering next step: ${step} for job ${jobId}`);

    switch (step) {
      case STEPS.TRANSCRIBE:
        await handleTranscribeStep(jobId, previousStepData);
        break;

      case STEPS.CLIP_VIDEO:
        await handleClipVideosStep(jobId, previousStepData);
        break;

      case STEPS.CROP_VIDEO:
        await handleCropVideo(jobId, previousStepData);
        break;

      case STEPS.FACE_DETECTION_AND_CROP:
        await handleFaceDetectionAndCrop(jobId, previousStepData);
        break;

      case STEPS.CAPTION_CLIP:
        await handleCaption(jobId, previousStepData);
        break;

      case STEPS.DELETE_VIDEO:
        await handleDeleteVideo(jobId);
    }
  }

  private async progressToNextStep(jobId: string, previousStepData: any) {
    const job = await jobFind(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const pipeline = PIPELINES[job.pipelineType];
    const completedSteps = JSON.parse(job.completedSteps);

    const nextStep = pipeline.find(s => !completedSteps.includes(s.step));

    if (nextStep) {
      await prisma.job.update({
        where: { id: jobId },
        data: { currentStep: nextStep.step }
      });

      await this.triggerNextStep(jobId, nextStep.step, previousStepData);
      return;
    }

    await prisma.job.update({
      where: { id: jobId },
      data: { status: STATUS.COMPLETED }
    });
  }
}

export const jobQueue = new JobQueue();
