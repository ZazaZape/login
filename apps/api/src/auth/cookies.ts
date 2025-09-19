import type { Response } from "express";
import { env, constants } from "@config/index";

export function setRefreshTokenCookie(res: Response, token: string): void {
  const cookieOptions: any = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: constants.REFRESH_TOKEN_TTL_MIN * 60 * 1000, // Convert to milliseconds
    path: "/",
  };
  
  // Only set domain in production - let browser use current host in development
  if (env.NODE_ENV === "production") {
    cookieOptions.domain = env.COOKIE_DOMAIN;
  }
  
  res.cookie(constants.COOKIE_NAME, token, cookieOptions);
}

export function clearRefreshTokenCookie(res: Response): void {
  const cookieOptions: any = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  };
  
  // Only set domain in production - let browser use current host in development
  if (env.NODE_ENV === "production") {
    cookieOptions.domain = env.COOKIE_DOMAIN;
  }
  
  res.clearCookie(constants.COOKIE_NAME, cookieOptions);
}
