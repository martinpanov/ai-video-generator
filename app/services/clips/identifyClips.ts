import { clipCreate } from "@/app/repositories/clipRepository";
import { videoUpdate } from "@/app/repositories/videoRepository";
import { getFormData } from "@/app/repositories/formRepository";
import { aiCommunication } from "@/app/lib/ai-communication";
import { parseAiResponse } from "@/app/utils/parseAiResponse";
import { getSrtTranscript } from "./srt";
import { toPublicUrl } from "@/app/utils/toPublicUrl";
import { ClipData } from "@/app/types";

type TranscribeResponseData = {
  response: {
    srt_url: string;
    text_url: string;
    segments_url: string;
  };
};

export async function identifyClips(jobId: string, previousStepData: TranscribeResponseData, userId: string, step: string) {
  await videoUpdate({
    jobId,
    data: {
      srtUrl: toPublicUrl(previousStepData.response.srt_url),
      textUrl: toPublicUrl(previousStepData.response.text_url),
      segmentsUrl: toPublicUrl(previousStepData.response.segments_url)
    }
  });

  const srtData = await getSrtTranscript(toPublicUrl(previousStepData.response.srt_url), step);
  const { videosAmount, videoDuration, splitVideo, videoUrl } = await getFormData(jobId);
  const data = await aiCommunication({ videosAmount, videoDuration, splitVideo, srtData, step });
  const clipsData: ClipData[] = parseAiResponse(data.content);

  return Promise.all(
    clipsData.map((clipData) =>
      clipCreate({
        clipData,
        videoUrl,
        jobId,
        userId
      })
    )
  );
}
