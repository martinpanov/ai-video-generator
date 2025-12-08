import { STEPS, WEBHOOK_URL } from "@/app/constants";
import { apiFetch } from "../../utils/api";
import { StepError } from "@/app/types";

export async function generateTranscript(mediaUrl: string, jobId: string) {
  const payload = {
    media_url: mediaUrl,
    task: "transcribe",
    include_text: true,
    include_srt: true,
    include_segments: true,
    word_timestamps: true,
    response_type: "cloud",
    language: "en",
    words_per_line: 6,
    webhook_url: `${WEBHOOK_URL}?jobId=${jobId}&step=${STEPS.TRANSCRIBE}`,
  };

  try {
    return apiFetch({ endpoint: "/v1/media/transcribe", method: "POST", body: payload });
  } catch (error) {
    console.error('Failed to generate transcript:', error);
    throw new StepError('Failed to generate transcript', STEPS.TRANSCRIBE);
  }
}