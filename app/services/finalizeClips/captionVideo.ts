import { STEPS } from "@/app/constants";
import { apiFetch } from "@/app/utils/api";

type Response = {
  build_number: number;
  code: number;
  id: string;
  job_id: string;
  message: string;
  pid: number;
  queue_id: number;
  queue_length: number;
  queue_time: number;
  response: string;
  run_time: number;
  total_time: number;
};

export async function captionVideo(videoUrl: string | null): Promise<Response> {
  try {
    const payload = {
      video_url: videoUrl,
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
      }
    };

    return await apiFetch({ endpoint: "/v1/video/caption", method: "POST", body: payload });
  } catch (error) {
    console.error('Failed to caption video:', error);

    const err = new Error('Failed to caption video');
    (err as any).step = STEPS.FINALIZE_CLIPS;
    throw err;
  }
}