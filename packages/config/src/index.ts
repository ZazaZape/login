import { config } from "dotenv";
import { z } from "zod";

// Load environment variables
config();

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // JWT/JWE
  JWT_ACCESS_SECRET: z.string().min(64),
  JWT_REFRESH_SECRET: z.string().min(64),
  JWE_ENC_KEY_BASE64: z.string(),
  
  // Token TTL
  ACCESS_TOKEN_TTL_SEC: z.string().transform(Number).default("900"),
  REFRESH_TOKEN_TTL_MIN: z.string().transform(Number).default("43200"),
  
  // CORS
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  COOKIE_DOMAIN: z.string().default("localhost"),
  
  // App
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("3001"),
});

export const env = envSchema.parse(process.env);

export const constants = {
  ACCESS_TOKEN_TTL_SEC: env.ACCESS_TOKEN_TTL_SEC,
  REFRESH_TOKEN_TTL_MIN: env.REFRESH_TOKEN_TTL_MIN,
  COOKIE_NAME: "refresh_token",
  CSRF_HEADER: "X-CSRF-Token",
  
  // Rate limiting
  LOGIN_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
  },
  
  // Session update threshold
  SESSION_UPDATE_THRESHOLD_SEC: 60,
} as const;
