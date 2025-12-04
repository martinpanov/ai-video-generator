'use server';

import { validation } from "../utils/validation";
import { videoValidationSchema } from "../videoValidationSchema";
import { requestVideoSocialMediaLink } from "../services/transcribe/videoSocialMedia";
import { generateMetadata } from "../services/transcribe/metadata";
import { generateTranscript } from "../services/transcribe/transcribe";
import { verifySession } from "../lib/session";
import { jobByUser } from "../repositories/jobRepository";
import { getPipelineType } from "../utils/getPipelineType";

const VIDEO_SOCIAL_MEDIA_URLS = ["youtube.com", "youtu.be", "youtube", "kick"];

export type VideoSubmitState = {
  success: boolean;
  message?: string;
  jobId?: string;
  videoUrl?: string;
  videosAmount?: string;
  videoDuration?: string;
  clipSize?: string;
  [key: string]: string | boolean | undefined;
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
    transcribeVideoEnabled: Boolean(formData.get("transcribe")),
    splitVideo: Boolean(formData.get("split-video"))
  };

  const { isValid, errors } = validation(data, videoValidationSchema);

  if (!isValid) {
    return { success: false, ...errors };
  }

  try {
    const userId = await verifySession();

    if (!userId) {
      return { success: false, message: "You don't have access to this job" };
    }

    const userJob = await jobByUser(userId);

    if (userJob) {
      return { success: true, jobId: userJob.id, message: "There is already job in progress" };
    }

    let jobId: string;

    const isVideoSocialMediaUrl = VIDEO_SOCIAL_MEDIA_URLS.some(url => data.videoUrl.includes(url));
    const isCropEnabled = !data.zoomVideoEnabled && Boolean(data.clipSize);
    const pipelineType = getPipelineType({
      isZoomEnabled: data.zoomVideoEnabled,
      isCaptionEnabled: data.transcribeVideoEnabled,
      isCropEnabled,
      videoType: isVideoSocialMediaUrl ? "VIDEO_SOCIAL_MEDIA" : "DIRECT"
    });

    if (isVideoSocialMediaUrl) {
      jobId = await requestVideoSocialMediaLink({ config: data, userId, pipelineType });
    } else {
      jobId = await generateMetadata({ config: data, userId, pipelineType });
      await generateTranscript(data.videoUrl, jobId);
    }

    return { success: true, jobId };
  } catch (error: any) {
    console.error('Failed to process video:', error);
    return { success: false, message: error.message || 'Failed to process video' };
  }
}