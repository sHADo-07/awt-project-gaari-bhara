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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("Exception");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] =
      "Something went wrong. Please try again later.";

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();
      message =
        typeof body === "string"
          ? body
          : ((body as any).message ?? exception.message);
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

  private fromDatabaseError(error: QueryFailedError) {
    const code = (error.driverError as { code?: string })?.code;
    switch (code) {
      case "23505":
        return {
          statusCode: HttpStatus.CONFLICT,
          message: "This value already exists",
        };
      case "23503":
        return /update or delete on table/i.test(error.message)
          ? {
              statusCode: HttpStatus.CONFLICT,
              message:
                "This record is still used by other records, so it cannot be deleted",
            }
          : {
              statusCode: HttpStatus.BAD_REQUEST,
              message: "A related record does not exist",
            };
      case "23P01":
        return {
          statusCode: HttpStatus.CONFLICT,
          message: "These dates are already taken",
        };
      case "23514":
      case "23502":
      case "22P02":
        return { statusCode: HttpStatus.BAD_REQUEST, message: "Invalid input" };
      default:
        return null;
    }
  }
}
