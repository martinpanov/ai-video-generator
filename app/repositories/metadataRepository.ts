import { videoFindByJob } from "./videoRepository";

export async function getMetadata(jobId: string) {
  const video = await videoFindByJob(jobId);

  return {
    response: {
      width: video.videoWidth,
      height: video.videoHeight
    }
  };
}
