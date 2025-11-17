import prisma from "@/app/lib/db";
import { jobUpdate } from "../../repositories/jobRepository";
import { clipFindByJob } from "../../repositories/clipRepository";
import { PIPELINES, STATUS } from "@/app/constants";
import { triggerNextStep } from "@/app/services/jobOrchestrator";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId') || '';
    const step = url.searchParams.get('step') || '';

    const webhookData = await request.json();

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await jobUpdate({ jobId, step, completedStep: step, data: webhookData });

    const clips = await clipFindByJob(jobId);
    const hasClipsInProgress = clips.some((c) => c.status !== STATUS.COMPLETED);

    if (hasClipsInProgress) {
      await triggerNextStep(jobId, { step }, webhookData);

      return NextResponse.json({ success: true });
    }

    const pipeline = PIPELINES[job.pipelineType];

    const currentStepIndex = pipeline.findIndex(s => s.step === step);
    const nextStep = pipeline[currentStepIndex + 1];

    if (nextStep) {
      await triggerNextStep(jobId, nextStep, webhookData);
    } else {
      // Pipeline complete
      await prisma.job.update({
        where: { id: jobId },
        data: { status: STATUS.COMPLETED }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing failed:', error);

    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (jobId) {
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status: STATUS.FAILED,
          failedStep: error.step || 'unknown',
          errorMessage: error.message || 'Webhook processing failed'
        }
      });
    }

    return NextResponse.json(
      { error: error.message || 'Webhook processing failed', step: error.step },
      { status: 500 }
    );
  }
}