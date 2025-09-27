const OriginalError = global.Error;

// Internal name doesn’t matter
class Error extends OriginalError {
  statusCode: number;
  type: string;

  constructor(message: string, statusCode = 500) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    if (OriginalError.captureStackTrace) {
      OriginalError.captureStackTrace(this, this.constructor);
    }

    this.statusCode = statusCode;

    // This is the value you want for logs / API responses
    this.type = "HttpError";
  }
}

// Attach globally
(global as any).HttpError = Error;

// Typings for TypeScript
declare global {
  var HttpError: typeof Error;
}
