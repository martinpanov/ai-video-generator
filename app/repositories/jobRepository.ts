import { prisma } from "../lib/db";
import { STATUS } from "../constants";
import { PipelineType } from "@/generated/prisma/enums";

export async function jobFind(jobId: string) {
  return prisma.job.findUnique({ where: { id: jobId } });
}

export async function jobCreate({
  data,
  step,
  completedStep,
  pipelineType,
  formData,
  userId
}: {
  data: any;
  step: string;
  completedStep?: string;
  pipelineType: PipelineType;
  formData?: { videoUrl: string; videosAmount: number; videoDuration: string; };
  userId: string;
}) {
  const completedSteps = completedStep ? [completedStep] : [];

  return prisma.job.create({
    data: {
      pipelineType,
      status: STATUS.PROCESSING,
      currentStep: step,
      completedSteps: JSON.stringify(completedSteps),
      stepData: JSON.stringify({ [completedStep || step]: data }),
      formData: JSON.stringify(formData || {}),
      userId
    }
  });
}

export async function jobUpdate({
  jobId,
  data,
  step,
  completedStep = null
}: {
  jobId: string;
  data: any;
  step: string;
  completedStep: any;
}) {
  const job = await jobFind(jobId);

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  const existingStepData = JSON.parse(job.stepData);
  const existingCompletedSteps = JSON.parse(job.completedSteps);

  let completedSteps = completedStep ? [...existingCompletedSteps, completedStep] : existingCompletedSteps;

  return prisma.job.update({
    where: { id: jobId },
    data: {
      currentStep: step,
      completedSteps: JSON.stringify(completedSteps),
      stepData: JSON.stringify({
        ...existingStepData,
        [completedStep]: data
      })
    }
  });
}

export async function jobDelete(jobId: string) {
  return prisma.job.delete({
    where: { id: jobId }
  });
}

export async function jobByUser(userId: string) {
  const userJob = await prisma.job.findFirst({
    where: { userId },
    orderBy: {
      createdAt: "desc"
    }
  });

  if (userJob?.status === STATUS.PROCESSING || userJob?.status === STATUS.PENDING) {
    return userJob;
  }
}