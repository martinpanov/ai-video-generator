import { prisma } from "../lib/db";
import { STATUS } from "../constants";
import { PipelineType } from "@/generated/prisma/enums";
import { FormDataType } from "../types";

export async function jobFind(jobId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });

  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  return job;
}

export async function jobCreate({
  step,
  completedStep,
  pipelineType,
  formData,
  userId
}: {
  step: string;
  completedStep?: string;
  pipelineType: PipelineType;
  formData?: FormDataType;
  userId: string;
}) {
  const completedSteps = completedStep ? [completedStep] : [];

  return prisma.job.create({
    data: {
      pipelineType,
      status: STATUS.PROCESSING,
      currentStep: step,
      completedSteps: JSON.stringify(completedSteps),
      formData: JSON.stringify(formData || {}),
      userId
    }
  });
}

export async function jobUpdate({
  jobId,
  step,
  completedStep = null
}: {
  jobId: string;
  step: string;
  completedStep: string | null;
}) {
  const job = await jobFind(jobId);
  const existingCompletedSteps = JSON.parse(job.completedSteps);

  const completedSteps = completedStep ? [...existingCompletedSteps, completedStep] : existingCompletedSteps;

  return prisma.job.update({
    where: { id: jobId },
    data: {
      currentStep: step,
      completedSteps: JSON.stringify(completedSteps)
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