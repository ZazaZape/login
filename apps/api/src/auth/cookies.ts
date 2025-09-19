import type { Response } from "express";
import { env, constants } from "@config/index";

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(constants.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    domain: env.COOKIE_DOMAIN,
    maxAge: constants.REFRESH_TOKEN_TTL_MIN * 60 * 1000, // Convert to milliseconds
    path: "/",
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(constants.COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    domain: env.COOKIE_DOMAIN,
    path: "/",
  });
}
