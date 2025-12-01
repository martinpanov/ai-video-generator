import { PipelineType } from "@/generated/prisma/enums";

type Params = {
  isZoomEnabled: boolean;
  isCaptionEnabled: boolean;
  videoType: "YOUTUBE" | "DIRECT";
};


export function getPipelineType({ isZoomEnabled, isCaptionEnabled, videoType }: Params) {
  if (isCaptionEnabled && isZoomEnabled) {
    return `${videoType}_CAPTION_ZOOM` as PipelineType;
  }

  if (isZoomEnabled) {
    return `${videoType}_ZOOM` as PipelineType;
  }

  if (isCaptionEnabled) {
    return `${videoType}_CAPTION` as PipelineType;
  }

  return videoType as PipelineType;
}