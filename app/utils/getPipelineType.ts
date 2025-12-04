import { PipelineType } from "@/generated/prisma/enums";

type Params = {
  isZoomEnabled: boolean;
  isCaptionEnabled: boolean;
  isCropEnabled: boolean;
  videoType: "VIDEO_SOCIAL_MEDIA" | "DIRECT";
};


export function getPipelineType({ isZoomEnabled, isCaptionEnabled, isCropEnabled, videoType }: Params) {
  if (isCaptionEnabled && isZoomEnabled) {
    return `${videoType}_CAPTION_ZOOM_FACE` as PipelineType;
  }

  if (isCaptionEnabled && isCropEnabled) {
    return `${videoType}_CAPTION_CROP` as PipelineType;
  }

  if (isZoomEnabled) {
    return `${videoType}_ZOOM_FACE` as PipelineType;
  }

  if (isCropEnabled) {
    return `${videoType}_CROP` as PipelineType;
  }

  if (isCaptionEnabled) {
    return `${videoType}_CAPTION` as PipelineType;
  }

  return videoType as PipelineType;
}