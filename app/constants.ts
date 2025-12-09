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