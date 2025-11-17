export type Config = {
  videoUrl: string;
  videosAmount?: number;
  videoDuration?: string;
  clipSize?: string;
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