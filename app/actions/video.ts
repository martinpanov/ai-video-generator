'use server';

import { validation } from "../utils/validation";
import { videoValidationSchema } from "../videoValidationSchema";

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
    videosAmount: formData.get('videos-amount') as string,
    videoDuration: formData.get('video-duration') as string,
    clipSize: formData.get('clip-size') as string
  };

  const { isValid, errors } = validation(data, videoValidationSchema);

  if (!isValid) {
    return { success: false, ...errors };
  }

  const response = await fetch("http://localhost:3000/api/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok || result.error) {
    return { success: false, message: result.error || 'Failed to process video' };
  }

  // Do more actions here...
  // await someOtherAction();
  // await anotherAction();

  // Return success - dialog stays open
  return { success: true };
}