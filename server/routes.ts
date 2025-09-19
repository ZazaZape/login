import type { Express } from "express";
import { createServer, type Server } from "http";
import authRouter from "../apps/api/src/routes/auth.routes.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Mount the real authentication routes from apps/api
  app.use("/api/auth", authRouter);

  const httpServer = createServer(app);

  return httpServer;
}
