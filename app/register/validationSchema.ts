export const registerValidationSchema = {
  username: {
    minLength: {
      value: 2,
      message: "The username must be at least 2 characters long"
    }
  },
  password: {
    minLength: {
      value: 8,
      message: "The password must be at least 8 characters long"
    },
    regex: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
      message: "The password should contain 1 capital letter, 1 lowercase letter and one symbol"
    }
  }
};