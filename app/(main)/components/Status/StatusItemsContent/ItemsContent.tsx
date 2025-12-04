import { PIPELINES, STATUS } from "@/app/constants";
import { ItemSkeleton } from "./ItemSkeleton";
import { JobStatusItem } from "./Item";
import { JobStatus } from "../types";

type GetStepStatusParams = {
  jobStatus: JobStatus | null;
  step: string;
  subSteps: string[];
};

const getStepStatus = ({ jobStatus, step, subSteps }: GetStepStatusParams) => {
  if (!jobStatus) return STATUS.PENDING;
  if (jobStatus.completedSteps.includes(step)) return STATUS.COMPLETED;

  const isAnyOfSubsteps = subSteps.some(substep => substep === jobStatus.step);

  if (jobStatus.status === STATUS.FAILED) return STATUS.FAILED;
  if (jobStatus.step === step || isAnyOfSubsteps) return STATUS.PROCESSING;

  return STATUS.PENDING;
};

export const JobStatusItemsContent = ({ jobStatus }: { jobStatus: JobStatus | null; }) => {
  const steps = jobStatus?.pipelineType ? PIPELINES[jobStatus.pipelineType] : [];
  const maxSteps = PIPELINES.VIDEO_SOCIAL_MEDIA_CAPTION_ZOOM_FACE;

  if (steps.length !== 0) {
    return steps.map(({ step, label, subSteps }) => {
      const status = getStepStatus({ jobStatus, step, subSteps: subSteps || [] });
      return <JobStatusItem key={step} status={status} label={label} />;
    });
  }

  return maxSteps.map(({ step }) => <ItemSkeleton key={step} />);
};