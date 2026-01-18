export const clipValidationSchema = {
  title: {
    minLength: {
      value: 1,
      message: "The title must be at least 1 characters long"
    }
  },
  originalVideoUrl: {
    regex: {
      value: /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/,
      message: "Invalid URL"
    }
  }
};