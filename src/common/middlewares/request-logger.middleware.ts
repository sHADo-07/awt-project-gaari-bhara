import { IRequest } from "@/common/interfaces/request.interface";
import { randomUUID } from "crypto";
import { NextFunction, Response } from "express";

export function requestLogger(
  req: IRequest,
  res: Response,
  next: NextFunction,
) {
  req.request_id = randomUUID();
  req.start_at = Date.now();
  res.setHeader("X-Request-Id", req.request_id);

  res.on("finish", () => {
    if (process.env.NODE_ENV === "test") return;
    const now = new Date().toISOString().replace("T", " ").replace(/\..+/, "");
    const ms = Date.now() - req.start_at;
    console.log(
      `[HTTP] [${now}] ${req.method} ${req.originalUrl.split("?")[0]} ${res.statusCode} ${ms}ms [${req.request_id}]`,
    );
  });
  next();
}
