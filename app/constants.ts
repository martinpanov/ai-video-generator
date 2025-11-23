export const WEBHOOK_URL = `https://sepulchral-hester-accusable.ngrok-free.dev/api/webhook`;
export const PROD_URL = 'https://videogenerator.yoannabest.com';

export const VIDEO_DETAILS = {
  VIDEOS_DURATION: ["1 minute", "2 minutes", "3 minutes"],
  VIDEOS_SIZES: ["1080x1920", "1920x1080", "1080x1080"]
};

export const STEPS = {
  DOWNLOAD: "download",
  TRANSCRIBE: "transcribe",
  CLIP_VIDEOS: "clip-videos",
  FINALIZE_CLIPS: "finalize-clips"
};

export const STATUS = {
  PROCESSING: "processing",
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed"
} as const;

const COMMON_STEPS = [
  { step: STEPS.TRANSCRIBE, subSteps: ["metaData"], label: "Transcribing audio" },
  { step: STEPS.CLIP_VIDEOS, subSteps: ["srtTranscript", "wordTimestamps"], label: "Clipping Videos" },
  { step: STEPS.FINALIZE_CLIPS, subSteps: [], label: "Finalizing clips" }
];

export const PIPELINES = {
  youtube: [
    { step: STEPS.DOWNLOAD, subSteps: [], label: "Downloading video" },
    ...COMMON_STEPS
  ],
  direct: COMMON_STEPS
};