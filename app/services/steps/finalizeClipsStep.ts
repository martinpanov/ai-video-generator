import { clipFindCompleted, clipUpdate } from "@/app/repositories/clipRepository";
import { cutAndScale } from "../finalizeClips/cutAndScale";
import { captionVideo } from "../finalizeClips/captionVideo";
import { getFormData } from "@/app/repositories/formRepository";

export async function handleFinalizeClipsStep(jobId: string) {
  const { zoomVideoEnabled, transcribeVideoEnabled } = await getFormData(jobId);

  if (!zoomVideoEnabled && !transcribeVideoEnabled) {
    return;
  }

  const clips = await clipFindCompleted(jobId);

  clips.forEach(async (clip) => {
    let finalVideo = clip.clipUrl as string;

    if (zoomVideoEnabled) {
      const scaledVideo = await cutAndScale(jobId, finalVideo, clip.thumbnailUrl);
      finalVideo = scaledVideo.response[0].file_url;
    }

    if (transcribeVideoEnabled) {
      const captionedVideo = await captionVideo(finalVideo);
      finalVideo = captionedVideo.response;
    }

    await clipUpdate({ clipId: clip.id, data: { finalClipUrl: finalVideo } });
  });
}