export type Config = {
  videoUrl: string;
  videosAmount?: number;
  videoDuration?: string;
  clipSize?: string;
};

export type RequiredConfig = Required<Config>;