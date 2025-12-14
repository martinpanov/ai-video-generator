import { prisma } from "@/app/lib/db";
import { jobQueue } from "@/app/services/jobQueue";
import { STATUS } from "@/app/constants";
import { NextResponse } from "next/server";
import { handleDeleteVideo } from "@/app/services/steps/deleteVideoStep";
import { StepError } from "@/app/types";

async function handleJobFailure(jobId: string, error: StepError) {
  if (!jobId) {
    return;
  }

  try {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: STATUS.FAILED,
        failedStep: error.step,
        errorMessage: error.message
      }
    });
  } catch (updateError) {
    console.error('Failed to update job status:', updateError);
  }

  // try {
  //   await handleDeleteVideo(jobId);
  // } catch (deleteError) {
  //   console.error('Failed to delete video:', deleteError);
  // }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId') || '';
    const step = url.searchParams.get('step') || '';

    const webhookData = await request.json();

    if (webhookData.code !== 200 && webhookData.code !== 202) {
      console.error('Failed to retrieve data from webhook call:', webhookData.message);
      throw new StepError('Failed to retrieve data from webhook call', step);
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await jobQueue.completeStep(jobId, step, webhookData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);

    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId') as string;
    const stepError = error as StepError;

    await handleJobFailure(jobId, stepError);

    return NextResponse.json(
      {
        error: stepError.message,
        step: stepError.step
      },
      { status: 500 }
    );
  }
}