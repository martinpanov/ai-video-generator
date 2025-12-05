import { videoFindByJob } from "./videoRepository";

export async function getMetadata(jobId: string) {
  const video = await videoFindByJob(jobId);

  if (!video) {
    throw new Error(`Video for job ${jobId} not found`);
  }

  return {
    response: {
      width: video.videoWidth,
      height: video.videoHeight
    }
  };
}
