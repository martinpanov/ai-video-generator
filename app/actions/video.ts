'use server';

import { validation } from "../utils/validation";
import { videoValidationSchema } from "../videoValidationSchema";
import { requestYoutubeLink } from "../services/transcribeVideo/youtube";
import { generateMetadata } from "../services/transcribeVideo/metadata";
import { generateTranscript } from "../services/transcribeVideo/transcribe";
import { verifySession } from "../lib/session";
import { jobByUser } from "../repositories/jobRepository";

const YOUTUBE_URLS = ["youtube.com", "youtu.be", "youtube"];

type VideoSubmitState = {
  success: boolean;
  message?: string;
  [key: string]: any;
} | undefined;

export async function handleVideoSubmit(
  state: VideoSubmitState,
  formData: FormData
) {
  const data = {
    videoUrl: formData.get('video-url') as string,
    videosAmount: Number(formData.get('videos-amount')),
    videoDuration: formData.get('video-duration') as string,
    clipSize: formData.get('clip-size') as string,
    zoomVideoEnabled: Boolean(formData.get("zoom")),
    transcribeVideoEnabled: Boolean(formData.get("transcribe"))
  };

  const { isValid, errors } = validation(data, videoValidationSchema);

  if (!isValid) {
    return { success: false, ...errors };
  }

  try {
    const isYoutubeUrl = YOUTUBE_URLS.some(url => data.videoUrl.includes(url));
    const userId = await verifySession();
    const userJob = await jobByUser(userId);

    if (userJob) {
      return { success: true, jobId: userJob.id, message: "There is already job in progress" };
    }

    let jobId: string;

    if (isYoutubeUrl) {
      jobId = await requestYoutubeLink({ config: data, userId });
    } else {
      jobId = await generateMetadata({ config: data, userId });
      await generateTranscript(data.videoUrl, jobId);
    }

    return { success: true, jobId };
  } catch (error: any) {
    console.error('Failed to process video:', error);
    return { success: false, message: error.message || 'Failed to process video' };
  }
}