class ApiError extends Error {
  constructor(statusCode, message = "Something went Wrong", stack = "") {
    super(message);
    this.statuscode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
