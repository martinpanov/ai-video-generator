export const PROD_URL = 'https://videogenerator.yoannabest.com';
export const WEBHOOK_URL = process.env.NODE_ENV === "production" ? `${PROD_URL}/api/webhook` : 'https://sepulchral-hester-accusable.ngrok-free.dev/api/webhook';

export const VIDEO_DETAILS = {
  VIDEOS_DURATION: ["1 minute", "2 minutes", "3 minutes"],
  VIDEOS_SIZES: ["1080x1920", "1920x1080", "1080x1080"]
};

export const STEPS = {
  DOWNLOAD: "download",
  TRANSCRIBE: "transcribe",
  CLIP_VIDEO: "clip-video",
  FINALIZE_CLIPS: "finalize-clips",
  CROP_VIDEO: "crop-video",
  FACE_DETECTION_AND_CROP: "face-detection-and-crop",
  CAPTION_CLIP: "caption-clip",
  DELETE_VIDEO: "delete-video"
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

const VIDEO_SOCIAL_MEDIA_STEP = { step: STEPS.DOWNLOAD, subSteps: [], label: "Downloading Video" };
const CROP_VIDEO_STEP = { step: STEPS.CROP_VIDEO, subSteps: [], label: "Calculating Clip Dimensions" };
const FACE_DETECTION_AND_CROP_STEP = { step: STEPS.FACE_DETECTION_AND_CROP, subSteps: [], label: "Calculating Clip Dimensions" };
const CAPTIONS_STEP = { step: STEPS.CAPTION_CLIP, subSteps: [], label: "Captioning Clip" };
const DELETE_VIDEO_STEP = { step: STEPS.DELETE_VIDEO, subSteps: [], label: "Deleting Video" };

export const PIPELINES = {
  VIDEO_SOCIAL_MEDIA: [
    VIDEO_SOCIAL_MEDIA_STEP,
    ...COMMON_STEPS,
    DELETE_VIDEO_STEP
  ],
  VIDEO_SOCIAL_MEDIA_ZOOM_FACE: [
    VIDEO_SOCIAL_MEDIA_STEP,
    ...COMMON_STEPS,
    FACE_DETECTION_AND_CROP_STEP,
    DELETE_VIDEO_STEP
  ],
  VIDEO_SOCIAL_MEDIA_CROP: [
    VIDEO_SOCIAL_MEDIA_STEP,
    ...COMMON_STEPS,
    CROP_VIDEO_STEP,
    DELETE_VIDEO_STEP
  ],
  VIDEO_SOCIAL_MEDIA_CAPTION: [
    VIDEO_SOCIAL_MEDIA_STEP,
    ...COMMON_STEPS,
    CAPTIONS_STEP,
    DELETE_VIDEO_STEP
  ],
  VIDEO_SOCIAL_MEDIA_CAPTION_ZOOM_FACE: [
    VIDEO_SOCIAL_MEDIA_STEP,
    ...COMMON_STEPS,
    FACE_DETECTION_AND_CROP_STEP,
    CAPTIONS_STEP,
    DELETE_VIDEO_STEP
  ],
  VIDEO_SOCIAL_MEDIA_CAPTION_CROP: [
    VIDEO_SOCIAL_MEDIA_STEP,
    ...COMMON_STEPS,
    CROP_VIDEO_STEP,
    CAPTIONS_STEP,
    DELETE_VIDEO_STEP
  ],


  DIRECT: COMMON_STEPS,
  DIRECT_ZOOM_FACE: [
    ...COMMON_STEPS,
    FACE_DETECTION_AND_CROP_STEP,
    DELETE_VIDEO_STEP
  ],
  DIRECT_CROP: [
    ...COMMON_STEPS,
    CROP_VIDEO_STEP,
    DELETE_VIDEO_STEP
  ],
  DIRECT_CAPTION: [
    ...COMMON_STEPS,
    CAPTIONS_STEP,
    DELETE_VIDEO_STEP
  ],
  DIRECT_CAPTION_ZOOM_FACE: [
    ...COMMON_STEPS,
    FACE_DETECTION_AND_CROP_STEP,
    CAPTIONS_STEP,
    DELETE_VIDEO_STEP
  ],
  DIRECT_CAPTION_CROP: [
    ...COMMON_STEPS,
    CROP_VIDEO_STEP,
    CAPTIONS_STEP,
    DELETE_VIDEO_STEP
  ],
};