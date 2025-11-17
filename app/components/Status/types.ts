export type JobStatus = {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  completedSteps: string[];
  step?: string;
  error?: string;
  pipelineType?: 'youtube' | 'direct';
};