export const todoValidationSchema = {
  todo: {
    regex: {
      value: /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/,
      message: "Invalid URL"
    }
  }
};