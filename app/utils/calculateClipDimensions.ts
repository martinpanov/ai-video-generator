import { getFormData } from "../repositories/formRepository";
import { getMetadata } from "../repositories/metadataRepository";

export async function calculateClipDimensions(jobId: string, x?: number, y?: number) {
  const metadata = await getMetadata(jobId);
  const formData = await getFormData(jobId);

  const videoWidth = Number(metadata.response.width);
  const videoHeight = Number(metadata.response.height);

  const clipWidth = Number(formData.clipSize.split("x")[0]);
  const clipHeight = Number(formData.clipSize.split("x")[1]);

  const videoAspectRatio = videoWidth / videoHeight;
  const clipAspectRatio = clipWidth / clipHeight;

  const cropXWidth = Math.ceil(videoAspectRatio > clipAspectRatio ? videoHeight * clipAspectRatio : videoWidth);
  const cropYHeight = Math.ceil(videoAspectRatio > clipAspectRatio ? videoHeight : videoWidth / clipAspectRatio);

  if (x && y) {
    const clipLeftXWidth = Math.ceil(Math.max(0, x - (cropXWidth / 2)));
    const clipTopYHeight = Math.ceil(Math.max(0, y - (cropYHeight / 2)));

    return { clipWidth, clipHeight, cropXWidth, cropYHeight, clipLeftXWidth, clipTopYHeight };
  }

  return { clipWidth, clipHeight, cropXWidth, cropYHeight };
}