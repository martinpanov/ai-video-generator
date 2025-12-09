import { STEPS, WEBHOOK_URL } from "@/app/constants";
import { apiFetch } from "@/app/utils/api";
import { Clip } from "@/generated/prisma/client";
import { StepError } from "@/app/types";

export async function captionVideo(clip: Clip, jobId: string) {
  const payload = {
    video_url: clip.clipUrl,
    settings: {
      line_color: "#FFFFFF",
      word_color: "#FFFF00",
      all_caps: false,
      max_words_per_line: 3,
      font_size: 60,
      bold: false,
      italic: false,
      underline: false,
      strikeout: false,
      outline_width: 3,
      shadow_offset: 4,
      style: "highlight",
      font_family: "The Bold Font",
      position: "bottom_center"
    },
    delete_input: true,
    webhook_url: `${WEBHOOK_URL}?jobId=${jobId}&step=${STEPS.CAPTION_CLIP}&clipId=${clip.id}`
  };

  try {
    return apiFetch({ endpoint: "/v1/video/caption", method: "POST", body: payload });
  } catch (error) {
    console.error('Failed to caption video:', error);
    throw new StepError('Failed to caption video', STEPS.CAPTION_CLIP);
  }
}