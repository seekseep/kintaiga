export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }

  toResponse(): Response {
    return Response.json({ error: this.message }, { status: this.status })
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad request') {
    super(400, message)
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message)
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(403, message)
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(404, message)
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(409, message)
  }
}

export class ValidationError extends HttpError {
  details: unknown[]

  constructor(details: unknown[]) {
    super(400, 'Validation failed')
    this.details = details
  }

  toResponse(): Response {
    return Response.json({ error: this.message, details: this.details }, { status: 400 })
  }
}

export class InternalError extends HttpError {
  constructor(message = 'Internal server error') {
    super(500, message)
  }
}

