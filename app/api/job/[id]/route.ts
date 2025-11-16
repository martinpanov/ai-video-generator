import { STATUS } from "@/app/constants";
import prisma from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string; }; }
) {
  try {
    const job = await prisma.job.findUnique({ where: { id: params.id } });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      completedSteps: JSON.parse(job.completedSteps),
      error: job.status === STATUS.FAILED ? job.errorMessage : null,
      step: job.status === STATUS.FAILED ? job.failedStep : job.currentStep
    });
  } catch (error: any) {
    console.error('Failed to fetch job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch job', step: null },
      { status: 500 }
    );
  }
}
