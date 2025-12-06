import { STEPS, WEBHOOK_URL } from "@/app/constants";
import { apiFetch } from "@/app/utils/api";

type CutAndScaleParams = {
  clipUrl: string;
  clipWidth: number;
  clipHeight: number;
  cropXWidth: number;
  cropYHeight: number;
  clipLeftXWidth?: number;
  clipTopYHeight?: number;
  jobId: string;
  step: string;
};

export async function cutAndScale(params: CutAndScaleParams) {
  const { clipUrl, clipWidth, clipHeight, cropXWidth, cropYHeight, clipLeftXWidth, clipTopYHeight, jobId, step } = params;

  const cropFilter = clipLeftXWidth && clipTopYHeight
    ? `crop=${cropXWidth}:${cropYHeight}:${clipLeftXWidth}:${clipTopYHeight}`
    : `crop=${cropXWidth}:${cropYHeight}`;

  const payload = {
    inputs: [
      {
        file_url: clipUrl,
        options: []
      }
    ],
    filters: [
      {
        filter: `[0:v]${cropFilter},scale=${clipWidth}:${clipHeight}[v]`
      }
    ],
    outputs: [
      {
        options: [
          {
            option: "-map",
            argument: "[v]"
          },
          {
            option: "-map",
            argument: "0:a"
          },
          {
            option: "-c:a",
            argument: "copy"
          }
        ]
      }
    ],
    delete_input: true,
    webhook_url: `${WEBHOOK_URL}?jobId=${jobId}&step=${step}`
  };

  try {
    return apiFetch({ endpoint: "/v1/ffmpeg/compose", method: "POST", body: payload });
  } catch (error) {
    console.error('Failed to cut and scale video:', error);

    const err = new Error('Failed to cut and scale video');
    (err as any).step = step;
    throw err;
  }
}