export const WEBHOOK_URL = `https://sepulchral-hester-accusable.ngrok-free.dev/api/webhook`;
export const PROD_URL = 'https://videogenerator.yoannabest.com';

export const VIDEO_DETAILS = {
  VIDEOS_DURATION: ["1 minute", "2 minutes", "3 minutes"],
  VIDEOS_SIZES: ["1080x1920", "1920x1080", "1080x1080"]
};

export const STEPS = {
  DOWNLOAD: "download",
  TRANSCRIBE: "transcribe",
  CLIP_VIDEO: "clip-video",
  FINALIZE_CLIPS: "finalize-clips",
  CALCULATE_CLIP_DIMENSIONS: "calculate-clip-dimensions",
  CAPTION_CLIP: "caption-clip"
};

export const STATUS = {
  PROCESSING: "Processing",
  PENDING: "Pending",
  COMPLETED: "Completed",
  FAILED: "Failed"
} as const;

const COMMON_STEPS = [
  { step: STEPS.TRANSCRIBE, subSteps: ["metaData"], label: "Transcribing Audio" },
  { step: STEPS.CLIP_VIDEO, subSteps: ["srtTranscript", "wordTimestamps"], label: "Clipping Videos" },
];

const YOUTUBE_STEP = { step: STEPS.DOWNLOAD, subSteps: [], label: "Downloading Video" };
const CLIP_DIMENSIONS_STEP = { step: STEPS.CALCULATE_CLIP_DIMENSIONS, subSteps: [], label: "Calculating Clip Dimensions" };
const CAPTIONS_STEP = { step: STEPS.CAPTION_CLIP, subSteps: [], label: "Captioning Clip" };

export const PIPELINES = {
  YOUTUBE: [
    YOUTUBE_STEP,
    ...COMMON_STEPS
  ],
  YOUTUBE_ZOOM: [
    YOUTUBE_STEP,
    ...COMMON_STEPS,
    CLIP_DIMENSIONS_STEP
  ],
  YOUTUBE_CAPTION: [
    YOUTUBE_STEP,
    ...COMMON_STEPS,
    CAPTIONS_STEP
  ],
  YOUTUBE_CAPTION_ZOOM: [
    YOUTUBE_STEP,
    ...COMMON_STEPS,
    CLIP_DIMENSIONS_STEP,
    CAPTIONS_STEP
  ],


  DIRECT: COMMON_STEPS,
  DIRECT_ZOOM: [
    ...COMMON_STEPS,
    CLIP_DIMENSIONS_STEP
  ],
  DIRECT_CAPTION: [
    ...COMMON_STEPS,
    CAPTIONS_STEP
  ],
  DIRECT_CAPTION_ZOOM: [
    ...COMMON_STEPS,
    CLIP_DIMENSIONS_STEP,
    CAPTIONS_STEP
  ],
};