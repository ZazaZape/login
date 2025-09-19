import { Router } from "express";
import { RateLimiterMemory } from "rate-limiter-flexible";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { constants } from "@config/index";

const router = Router();

// Rate limiter for auth endpoints
const authRateLimiter = new RateLimiterMemory({
  keyGen: (req: any) => req.ip,
  points: constants.LOGIN_RATE_LIMIT.max,
  duration: constants.LOGIN_RATE_LIMIT.windowMs / 1000,
});

// Apply rate limiting to sensitive auth endpoints
const rateLimitMiddleware = async (req: any, res: any, next: any) => {
  try {
    await authRateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      ok: false,
      code: "TOO_MANY_REQUESTS",
      message: "Demasiados intentos de login. Intenta más tarde.",
    });
  }
};

router.post("/login", rateLimitMiddleware, authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", requireAuth, authController.logout);
router.get("/me", requireAuth, authController.me);

export default router;
