import { STEPS } from "@/app/constants";
import { apiFetch } from "@/app/utils/api";

export async function deleteVideo(fileUrl: string) {
  try {
    await apiFetch({ endpoint: "/v1/s3/delete", method: "POST", body: fileUrl });
  } catch (error) {
    console.error('Failed to delete video:', error);

    const err = new Error('Failed to delete video');
    (err as any).step = STEPS.CLIP_VIDEOS;
    throw err;
  }
}