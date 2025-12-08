import { STATUS } from "@/app/constants";
import { clipFindByJob, clipUpdate } from "@/app/repositories/clipRepository";
import { jobQueue } from "../services/jobQueue";
import { Clip } from "@/generated/prisma/client";

type ProcessClipFn<T extends unknown[]> = (clip: Clip, ...args: T) => Promise<void>;
type HandleResponseFn<K extends Record<string, unknown>, T extends unknown[]> = (processingClip: Clip, previousStepData: K, ...args: T) => Promise<void>;

/**
 * Reset clips to PENDING when transitioning from a previous step.
 * Only resets if ALL clips are COMPLETED (no PROCESSING or PENDING clips).
 * This ensures the reset only happens once when entering a new step.
 */
export async function resetClipsForNewStep(jobId: string, step: string): Promise<void> {
  const clips = await clipFindByJob(jobId);

  if (clips.length === 0) {
    return;
  }

  const hasProcessingOrPending = clips.some((c: Clip) =>
    c.status === STATUS.PROCESSING || c.status === STATUS.PENDING
  );

  if (!hasProcessingOrPending) {
    await Promise.all(
      clips.map((clip: Clip) =>
        clipUpdate({
          clipId: clip.id,
          data: { status: STATUS.PENDING },
          step
        })
      )
    );
  }
}

interface ClipProcessorConfig<K extends Record<string, unknown>, T extends unknown[]> {
  jobId: string;
  step: string;
  previousStepData?: K;
  processClipFn: ProcessClipFn<T>;
  handleResponseFn?: HandleResponseFn<K, T>;
  additionalArgs?: T;
}

/**
 * Reusable pattern for processing clips one by one in a step.
 *
 * This function handles:
 * 1. First invocation: Process the first clip
 * 2. Subsequent invocations with response: Update the processing clip, then process next pending clip
 * 3. When all clips are done: Complete the step
 *
 * @param config.jobId - The job ID
 * @param config.step - The current step (e.g., STEPS.CLIP_VIDEO)
 * @param config.previousStepData - Data from the webhook/previous step (contains response if available)
 * @param config.processClipFn - Function to process a single clip (async)
 * @param config.handleResponseFn - Optional function to handle the response data for a completed clip
 * @param config.additionalArgs - Additional arguments to pass to processClipFn and handleResponseFn
 */
export async function processClipsSequentially<K extends Record<string, unknown>, T extends unknown[]>(config: ClipProcessorConfig<K, T>): Promise<void> {
  const { jobId, step, previousStepData, processClipFn, handleResponseFn, additionalArgs } = config;

  const clips = await clipFindByJob(jobId);

  if (clips.length === 0) {
    throw new Error("No clips found for job");
  }

  const processingClip = clips.find((c) => c.status === STATUS.PROCESSING);

  if (!processingClip) {
    await processClipFn(clips[0], ...(additionalArgs || [] as unknown as T));
    return;
  }

  if (handleResponseFn && previousStepData?.response) {
    await handleResponseFn(processingClip, previousStepData, ...(additionalArgs || [] as unknown as T));

    const updatedClips = await clipFindByJob(jobId);
    const updatedProcessingClip = updatedClips.find((c) => c.id === processingClip.id);

    if (updatedProcessingClip?.status === STATUS.PROCESSING) {
      return;
    }

    const nextPendingClip = updatedClips.find((c) => c.status === STATUS.PENDING);

    if (nextPendingClip) {
      await processClipFn(nextPendingClip, ...(additionalArgs || [] as unknown as T));
      return;
    }

    await jobQueue.completeStep(jobId, step, {});
  }
}
