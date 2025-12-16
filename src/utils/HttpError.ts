const OriginalError = global.Error

// Internal name doesn’t matter
class HttpError extends OriginalError {
  statusCode: number
  type: string

  constructor(message: string, statusCode = 500) {
    super(message)

    Object.setPrototypeOf(this, new.target.prototype)

    if (OriginalError.captureStackTrace) {
      OriginalError.captureStackTrace(this, this.constructor)
    }

    this.statusCode = statusCode

    // This is the value you want for logs / API responses
    this.type = 'HttpError'
  }
}

// Attach globally
;(global as any).HttpError = HttpError

// Typings for TypeScript
export {} // Ensure this file is treated as a module
declare global {
  // Avoid self-referencing by using a workaround
  // Define a separate interface for the global HttpError type
  var HttpError: {
    new (message: string, statusCode?: number): HttpError
  }
}
