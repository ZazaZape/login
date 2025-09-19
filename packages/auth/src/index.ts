export interface AuthPayload {
  userId: number;
  roleId: number;
  sid: string;
  permissions: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  sub: number;
  sid: string;
  rid: number;
  jti: string;
}

export interface AccessTokenPayload {
  sub: number;
  sid: string;
  rid: number;
  permissions: string[];
}

export * from "@shared/index";
