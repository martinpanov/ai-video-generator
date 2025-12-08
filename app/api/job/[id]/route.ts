import { STATUS } from "@/app/constants";
import { jobFind } from "@/app/repositories/jobRepository";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; }>; }
) {
  try {
    const { id } = await params;
    const job = await jobFind(id);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      pipelineType: job.pipelineType,
      completedSteps: JSON.parse(job.completedSteps),
      step: job.status === STATUS.FAILED ? job.failedStep : job.currentStep,
      error: job.status === STATUS.FAILED ? job.errorMessage : null
    });
  } catch (error) {
    console.error('Failed to fetch job:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job', step: null },
      { status: 500 }
    );
  }
}
