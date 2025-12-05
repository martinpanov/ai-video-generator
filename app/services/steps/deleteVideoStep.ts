import { videoFindByJob } from "@/app/repositories/videoRepository";
import { STEPS } from "@/app/constants";
import { apiFetch } from "@/app/utils/api";

function extractTranscriptionId(url: string | null): string | null {
  if (!url) return null;

  const match = url.match(/\/([^\/]+)\.(txt|srt|json)$/);
  return match ? match[1] : null;
}

export async function handleDeleteVideo(jobId: string) {
  try {
    const video = await videoFindByJob(jobId);

    if (!video) {
      throw new Error(`Video for job ${jobId} not found`);
    }

    const transcriptionId =
      extractTranscriptionId(video.srtUrl) ||
      extractTranscriptionId(video.segmentsUrl) ||
      extractTranscriptionId(video.textUrl);

    const body: any = {
      video_url: video.videoUrl
    };

    if (transcriptionId) {
      body.transcription_id = transcriptionId;
    }

    apiFetch({ endpoint: "/v1/video/delete", method: "POST", body });
  } catch (error) {
    console.error('Failed to delete video:', error);

    const err = new Error('Failed to delete video');
    (err as any).step = STEPS.DELETE_VIDEO;
    throw err;
  }
}