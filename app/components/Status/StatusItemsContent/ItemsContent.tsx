import { PIPELINES, STATUS } from "@/app/constants";
import { ItemSkeleton } from "./ItemSkeleton";
import { JobStatusItem } from "./Item";
import { JobStatus } from "../types";

export const JobStatusItemsContent = ({ jobStatus }: { jobStatus: JobStatus | null; }) => {
  const steps = jobStatus?.pipelineType ? PIPELINES[jobStatus.pipelineType] : [];
  const maxSteps = PIPELINES.youtube;

  const getStepStatus = (stepName: string, subSteps: string[]) => {
    if (!jobStatus) return STATUS.PENDING;
    if (jobStatus.completedSteps.includes(stepName)) return STATUS.COMPLETED;

    const isAnyOfSubsteps = subSteps.some(substep => substep === jobStatus.step);

    if (jobStatus.step === stepName || isAnyOfSubsteps) return STATUS.PROCESSING;
    return STATUS.PENDING;
  };

  if (steps.length !== 0) {
    return steps.map(({ step, label, subSteps }) => {
      const status = getStepStatus(step, subSteps || []);
      return <JobStatusItem key={step} status={status} label={label} />;
    });
  }

  return maxSteps.map(({ step }) => <ItemSkeleton key={step} />);
};