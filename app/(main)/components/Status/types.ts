import { Status } from "@/app/types";
import { PipelineType } from "@/generated/prisma/enums";

export type JobStatus = {
  id: string;
  status: Status;
  completedSteps: string[];
  step?: string;
  error?: string;
  pipelineType?: PipelineType;
  formData?: {
    transcribe?: boolean;
    zoom?: boolean;
  };
};