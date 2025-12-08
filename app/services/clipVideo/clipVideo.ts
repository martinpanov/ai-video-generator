import { STEPS, WEBHOOK_URL } from "@/app/constants";
import { apiFetch } from "../../utils/api";
import { StepError } from "@/app/types";

type Params = {
  timeStart: number;
  videoDuration: number;
  videoUrl: string;
  jobId: string;
};

export async function clipVideo({ timeStart, videoDuration, videoUrl, jobId }: Params) {
  const payload = {
    inputs: [
      {
        file_url: videoUrl,
        options: [
          {
            option: "-ss",
            argument: timeStart
          },
          {
            option: "-t",
            argument: videoDuration
          }
        ]
      }
    ],
    filters: [],
    outputs: [
      {
        options: [
          {
            option: "-c",
            argument: "copy"
          }
        ]
      }
    ],
    metadata: {
      thumbnail: true
    },
    webhook_url: `${WEBHOOK_URL}?jobId=${jobId}&step=${STEPS.CLIP_VIDEO}`
  };

  try {
    return apiFetch({ endpoint: "/v1/ffmpeg/compose", method: "POST", body: payload });
  } catch (error) {
    console.error('Failed to clip video:', error);
    throw new StepError('Failed to clip video', STEPS.CLIP_VIDEO);
  }
}