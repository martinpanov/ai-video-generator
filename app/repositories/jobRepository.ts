import { prisma } from "../lib/db";
import { STATUS } from "../constants";

export async function jobCreate({
  data,
  step,
  pipelineType,
  formData,
  userId
}: {
  data: any;
  step: string;
  pipelineType: 'youtube' | 'direct';
  formData?: { videoUrl: string; videosAmount: number; videoDuration: string; };
  userId: string | null;
}) {
  return await prisma.job.create({
    data: {
      pipelineType,
      status: STATUS.PROCESSING,
      currentStep: step,
      completedSteps: JSON.stringify([]),
      stepData: JSON.stringify({ [step]: data }),
      formData: JSON.stringify(formData || {}),
      userId
    }
  });
}

export async function jobUpdate({ jobId, step, completedStep, data }: any) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const existingStepData = JSON.parse(job.stepData);
  const existingCompletedSteps = JSON.parse(job.completedSteps);

  return await prisma.job.update({
    where: { id: jobId },
    data: {
      currentStep: step,
      completedSteps: JSON.stringify([...existingCompletedSteps, completedStep]),
      stepData: JSON.stringify({
        ...existingStepData,
        [step]: data
      })
    }
  });
}

export async function jobDelete(jobId: string) {
  return await prisma.job.delete({
    where: { id: jobId }
  });
}

export async function jobByUser(userId: string | null) {
  const userJob = await prisma.job.findFirst({
    where: { userId }
  });

  if (userJob?.status === STATUS.PROCESSING || userJob?.status === STATUS.PENDING) {
    return userJob;
  }
}