import { videoFindByJob } from "@/app/repositories/videoRepository";
import { STEPS } from "@/app/constants";
import { apiFetch } from "@/app/utils/api";
import { prisma } from "@/app/lib/db";
import { StepError } from "@/app/types";

function extractTranscriptionId(url: string | null): string | null {
  if (!url) return null;

  const match = url.match(/\/([^\/]+)\.(txt|srt|json)$/);
  return match ? match[1] : null;
}

export async function handleDeleteVideo(jobId: string) {
  try {
    const video = await videoFindByJob(jobId);
    const transcriptionId =
      extractTranscriptionId(video.srtUrl) ||
      extractTranscriptionId(video.segmentsUrl) ||
      extractTranscriptionId(video.textUrl);

    const body = {
      video_url: video.videoUrl,
      ...(transcriptionId && { transcription_id: transcriptionId })
    };

    apiFetch({ endpoint: "/v1/video/delete", method: "POST", body });
    await prisma.video.delete({ where: { id: video.id } });
  } catch (error) {
    console.error('Failed to delete video:', error);
    throw new StepError('Failed to delete video', STEPS.DELETE_VIDEO);
  }
}