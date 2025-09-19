import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("Error:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  res.status(status).json({
    ok: false,
    code: err.code || "INTERNAL_ERROR",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
