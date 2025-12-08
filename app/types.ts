export type FormDataType = {
  videoUrl: string;
  videosAmount?: number;
  videoDuration?: string;
  clipSize?: string;
  zoomVideoEnabled?: boolean;
  transcribeVideoEnabled?: boolean;
  splitVideo?: boolean;
};

export type RequiredFormDataType = Required<FormDataType>;

export type ClipData = {
  clip: string;
  description: string;
  post: string;
  timeEnd: string;
  timeStart: string;
  title: string;
};

export type Status = "Processing" | "Completed" | "Pending" | "Failed";

export class StepError extends Error {
  step: string;

  constructor(message: string, step: string) {
    super(message);
    this.name = 'StepError';
    this.step = step;
  }
}