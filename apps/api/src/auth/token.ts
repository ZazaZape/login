import { SignJWT, jwtVerify, EncryptJWT, jwtDecrypt } from "jose";
import { randomBytes } from "crypto";
import { env, constants } from "@config/index";
import type { AccessTokenPayload, RefreshTokenPayload } from "@auth/index";

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
const encryptionKey = Buffer.from(env.JWE_ENC_KEY_BASE64, "base64");

export async function createAccessToken(payload: Omit<AccessTokenPayload, "exp" | "iat">): Promise<string> {
  // First create JWT
  const jwt = await new SignJWT({
    sub: payload.sub.toString(),
    sid: payload.sid,
    rid: payload.rid,
    permissions: payload.permissions,
  })
    .setProtectedHeader({ alg: "HS512" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + constants.ACCESS_TOKEN_TTL_SEC)
    .sign(accessSecret);

  // Then encrypt with JWE
  const jwe = await new EncryptJWT({ jwt })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + constants.ACCESS_TOKEN_TTL_SEC)
    .encrypt(encryptionKey);

  return jwe;
}

export async function createRefreshToken(payload: Omit<RefreshTokenPayload, "exp" | "iat">): Promise<string> {
  return await new SignJWT({
    sub: payload.sub.toString(),
    sid: payload.sid,
    rid: payload.rid,
    jti: payload.jti,
  })
    .setProtectedHeader({ alg: "HS512" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + (constants.REFRESH_TOKEN_TTL_MIN * 60))
    .sign(refreshSecret);
}

export async function verifyAccessToken(jwe: string): Promise<AccessTokenPayload> {
  try {
    // First decrypt JWE
    const { payload: jwePayload } = await jwtDecrypt(jwe, encryptionKey);
    const jwt = jwePayload.jwt as string;

    // Then verify JWT
    const { payload } = await jwtVerify(jwt, accessSecret);
    
    return {
      sub: parseInt(payload.sub as string),
      sid: payload.sid as string,
      rid: payload.rid as number,
      permissions: payload.permissions as string[],
    };
  } catch (error) {
    throw new Error("Invalid access token");
  }
}

export async function verifyRefreshToken(jwt: string): Promise<RefreshTokenPayload> {
  try {
    const { payload } = await jwtVerify(jwt, refreshSecret);
    
    return {
      sub: parseInt(payload.sub as string),
      sid: payload.sid as string,
      rid: payload.rid as number,
      jti: payload.jti as string,
    };
  } catch (error) {
    throw new Error("Invalid refresh token");
  }
}

export function generateJTI(): string {
  return randomBytes(16).toString("hex");
}
