import { IRequest } from "@/common/interfaces/request.interface";
import { randomUUID } from "crypto";
import { NextFunction, Response } from "express";

/**
 * Runs before every route (bonus: Middleware).
 *  - gives each request an id and sends it back in the header X-Request-Id
 *  - writes ONE log line when the answer is sent: method, path, status, time
 * It never logs headers, tokens or bodies.
 */
export function requestLogger(req: IRequest, res: Response, next: NextFunction) {
  req.request_id = randomUUID();
  req.start_at = Date.now();
  res.setHeader("X-Request-Id", req.request_id);

  res.on("finish", () => {
    if (process.env.NODE_ENV === "test") return; // keep test output clean
    const now = new Date().toISOString().replace("T", " ").replace(/\..+/, "");
    const ms = Date.now() - req.start_at;
    console.log(
      `[HTTP] [${now}] ${req.method} ${req.originalUrl.split("?")[0]} ${res.statusCode} ${ms}ms [${req.request_id}]`,
    );
  });
  next();
}
