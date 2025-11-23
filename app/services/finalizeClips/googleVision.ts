import { getFormData } from "@/app/repositories/formRepository";
import { getMetadata } from "@/app/repositories/metadataRepository";

function getMouthPosition(data: Record<string, any>) {
  const faceData = data.itemjson.response[0].faceAnnotations[0];

  const mouthCenter = faceData.landmarks.find((lm: any) => lm.type === "MOUTH_CENTER");

  return {
    x: Math.round(mouthCenter.position.x),
    y: Math.round(mouthCenter.position.y),
    z: Math.round(mouthCenter.position.z)
  };
}

async function googleVisionCordinates(thumbnailUrl: string | null) {
  const body = {
    request: [
      {
        image: {
          source: {
            imageUri: thumbnailUrl
          }
        },
        features: [
          {
            type: "FACE_DETECTION",
            maxResults: 10
          }
        ]
      }
    ]
  };

  const response = await fetch("https://vision.googleapis.com/v1/images:annotate", {
    method: "POST",
    headers: {
      key: process.env.CLOUD_VISION_API_KEY || ""
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  return getMouthPosition(data);
}

export async function getCordinates(jobId: string, thumbnailUrl: string | null) {
  const metadata = await getMetadata(jobId);
  const formData = await getFormData(jobId);
  const { x, y } = await googleVisionCordinates(thumbnailUrl);

  const videoWidth = Number(metadata.response.width);
  const videoHeight = Number(metadata.respons.height);

  const clipWidth = Number(formData.clipSize.split("x")[0]);
  const clipHeight = Number(formData.clipSize.split("x")[1]);

  const videoAspectRatio = videoWidth / videoHeight;
  const clipAspectRatio = clipWidth / clipHeight;

  const cropXWidth = Math.ceil(videoAspectRatio > clipAspectRatio ? videoHeight * clipAspectRatio : videoWidth);
  const cropYHeight = Math.ceil(videoAspectRatio > clipAspectRatio ? videoHeight : videoWidth / clipAspectRatio);
  const clipLeftXWidth = Math.ceil(Math.max(0, x - (cropXWidth / 2)));
  const clipTopYHeight = Math.ceil(Math.max(0, y - (cropYHeight / 2)));

  return { clipWidth, clipHeight, cropXWidth, cropYHeight, clipLeftXWidth, clipTopYHeight };
}