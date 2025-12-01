import { STEPS } from "@/app/constants";
import { apiFetch } from "@/app/utils/api";

export async function deleteVideo(fileUrl: string) {
  try {
    return apiFetch({ endpoint: "/v1/s3/delete", method: "POST", body: fileUrl });
  } catch (error) {
    console.error('Failed to delete video:', error);

    const err = new Error('Failed to delete video');
    (err as any).step = STEPS.CLIP_VIDEO;
    throw err;
  }
}