export const WEBHOOK_URL = `https://sepulchral-hester-accusable.ngrok-free.dev/api/webhook`;
export const PROD_URL = 'https://videogenerator.yoannabest.com';

export const VIDEO_DETAILS = {
  VIDEOS_DURATION: ["1 minute", "2 minutes", "3 minutes"],
  VIDEOS_SIZES: ["1080x1920", "1920x1080", "1080x1080"]
};

export const STEPS = {
  DOWNLOAD: "download",
  TRANSCRIBE: "transcribe",
  CLIP_VIDEOS: "clip-videos"
};

export const STATUS = {
  PROCESSING: "processing",
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed"
};

export const PIPELINES = {
  youtube: [
    { step: STEPS.DOWNLOAD, label: "Downloading video" },
    { step: STEPS.TRANSCRIBE, label: "Transcribing audio" },
    { step: STEPS.CLIP_VIDEOS, label: "Clipping Videos", }
  ],
  direct: [
    { step: STEPS.TRANSCRIBE, label: "Transcribing audio" },
    { step: STEPS.CLIP_VIDEOS, label: "Clipping Videos", }
  ]
};