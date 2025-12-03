export type Config = {
  videoUrl: string;
  videosAmount?: number;
  videoDuration?: string;
  clipSize?: string;
  zoomVideoEnabled?: boolean;
  transcribeVideoEnabled?: boolean;
  splitVideo?: boolean;
};

export type RequiredConfig = Required<Config>;

export type ClipData = {
  clip: string;
  description: string;
  post: string;
  timeEnd: string;
  timeStart: string;
  title: string;
};

export type Status = "Processing" | "Completed" | "Pending" | "Failed";