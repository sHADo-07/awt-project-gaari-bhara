import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { STATUS_CODES } from "http";
import { QueryFailedError } from "typeorm";

/**
 * One error shape for the whole API:
 *   { statusCode, error, message, path, timestamp }
 * - Errors we throw (NotFoundException, ConflictException ...) keep their status and message.
 * - Database errors become a clear 409 or 400 (for example a duplicate email).
 * - Anything unknown becomes a plain 500. The stack trace is only written in the server log.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("Exception");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = "Something went wrong. Please try again later.";

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      message =
        typeof body === "string" ? body : ((body as any).message ?? exception.message);
    } else if (exception instanceof QueryFailedError) {
      const known = this.fromDatabaseError(exception);
      if (known) {
        statusCode = known.statusCode;
        message = known.message;
      } else {
        this.logger.error(exception.message, exception.stack);
      }
    } else {
      this.logger.error(String(exception), (exception as Error)?.stack);
    }

    res.status(statusCode).json({
      statusCode,
      error: STATUS_CODES[statusCode] ?? "Error",
      message,
      path: req.originalUrl.split("?")[0],
      timestamp: new Date().toISOString(),
    });
  }

  /** PostgreSQL error codes -> HTTP answers. */
  private fromDatabaseError(error: QueryFailedError) {
    const code = (error.driverError as { code?: string })?.code;
    switch (code) {
      case "23505": // unique violation
        return { statusCode: HttpStatus.CONFLICT, message: "This value already exists" };
      case "23503": // foreign key violation
        return /update or delete on table/i.test(error.message)
          ? { statusCode: HttpStatus.CONFLICT, message: "This record is still used by other records, so it cannot be deleted" }
          : { statusCode: HttpStatus.BAD_REQUEST, message: "A related record does not exist" };
      case "23P01": // exclusion violation (two rents on the same days)
        return { statusCode: HttpStatus.CONFLICT, message: "These dates are already taken" };
      case "23514": // check violation
      case "23502": // not null violation
      case "22P02": // invalid text representation (bad uuid or enum)
        return { statusCode: HttpStatus.BAD_REQUEST, message: "Invalid input" };
      default:
        return null;
    }
  }
}
