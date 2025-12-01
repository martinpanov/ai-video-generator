import { prisma } from "@/app/lib/db";
import { jobQueue } from "@/app/services/jobQueue";
import { STATUS } from "@/app/constants";
import { NextResponse } from "next/server";
import { jobFind } from "@/app/repositories/jobRepository";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId') || '';
    const step = url.searchParams.get('step') || '';

    const webhookData = await request.json();

    if (webhookData.code !== 200 && webhookData.code !== 202) {
      console.error('Failed to retrieve data from webhook call:', webhookData.message);

      const err = new Error('Failed to retrieve data from webhook call');
      (err as any).step = step;
      throw err;
    }

    const job = await jobFind(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    await jobQueue.completeStep(jobId, step, webhookData);

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