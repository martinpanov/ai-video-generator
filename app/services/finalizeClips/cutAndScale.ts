import { STEPS } from "@/app/constants";
import { apiFetch } from "@/app/utils/api";
import { getCordinates } from "./googleVision";

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
  response: [
    {
      file_url: string;
    }
  ];
  run_time: number;
  total_time: number;
};

export async function cutAndScale(jobId: string, clipUrl: string | null, thumbnailUrl: string | null): Promise<Response> {
  try {
    const cordinates = await getCordinates(jobId, thumbnailUrl);

    const payload = {
      inputs: [
        {
          file_url: clipUrl,
          options: []
        }
      ],
      filters: [
        {
          filter: `[0:v]crop=${cordinates.cropXWidth}:${cordinates.cropYHeight}:${cordinates.clipLeftXWidth}:${cordinates.clipTopYHeight},scale=${cordinates.clipWidth}:${cordinates.clipHeight}[v]`
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
      ]
    };

    return await apiFetch({ endpoint: "/v1/ffmpeg/compose", method: "POST", body: payload });
  } catch (error) {
    console.error('Failed to cut and scale video:', error);

    const err = new Error('Failed to cut and scale video');
    (err as any).step = STEPS.FINALIZE_CLIPS;
    throw err;
  }
}