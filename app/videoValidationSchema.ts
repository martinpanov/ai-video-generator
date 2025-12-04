import { VIDEO_DETAILS } from "./constants";

export const videoValidationSchema = {
  videoUrl: {
    regex: {
      value: /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/,
      message: "Invalid URL"
    }
  },
  videosAmount: {
    min: {
      value: 1,
      message: "Amount should be at least 1"
    },
    max: {
      value: 5,
      message: "Amount should be at most 5"
    }
  },
  videoDuration: {
    isEqualTo: {
      value: VIDEO_DETAILS.VIDEOS_DURATION,
      message: "Invalid Video Duration"
    },
    skip: {
      splitVideo: true
    }
  },
  clipSize: {
    isEqualTo: {
      value: VIDEO_DETAILS.VIDEOS_SIZES,
      message: "Invalid Clip Size"
    }
  }
};