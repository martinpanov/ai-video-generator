import { STEPS, WEBHOOK_URL } from "@/app/constants";
import { apiFetch } from "@/app/utils/api";
import { Clip } from "@/generated/prisma/client";

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
    webhook_url: `${WEBHOOK_URL}?jobId=${jobId}&step=${STEPS.CAPTION_CLIP}`
  };

  try {
    return apiFetch({ endpoint: "/v1/video/caption", method: "POST", body: payload });
  } catch (error) {
    console.error('Failed to caption video:', error);

    const err = new Error('Failed to caption video');
    (err as any).step = STEPS.CAPTION_CLIP;
    throw err;
  }
}