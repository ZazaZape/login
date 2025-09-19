import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "@config/index";
import { errorHandler } from "./middlewares/errorHandler.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import menuRoutes from "./routes/menu.routes.js";

export function createApp() {
  const app = express();

  // Security middlewares
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // CORS
  app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
  }));

  // Body parsing
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Cookie parsing
  app.use(cookieParser());

  // Logging
  if (env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  } else {
    app.use(morgan("combined"));
  }

  // Trust proxy for correct IP addresses
  app.set("trust proxy", 1);

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API routes
  app.use("/auth", authRoutes);
  app.use("/usuarios", usersRoutes);
  app.use("/menu", menuRoutes);

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({
      ok: false,
      code: "NOT_FOUND",
      message: "Endpoint no encontrado",
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}
