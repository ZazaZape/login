import { randomUUID } from "crypto";
import { UserRepository } from "../repositories/user.repo.js";
import { SessionRepository } from "../repositories/session.repo.js";
import { RbacRepository } from "../repositories/rbac.repo.js";
import { createAccessToken, createRefreshToken, generateJTI, verifyRefreshToken } from "../auth/token.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import type { AuthResponse } from "@shared/index";

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private sessionRepo: SessionRepository,
    private rbacRepo: RbacRepository
  ) {}

  async login(usuario: string, password: string, clientInfo?: {
    ip?: string;
    userAgent?: string;
    deviceInfo?: any;
  }): Promise<{ authResponse: AuthResponse; refreshToken: string }> {
    // 1. Verify credentials
    const user = await this.userRepo.findByUsername(usuario);
    if (!user || !user.usuario_habilitado) {
      throw new Error("Credenciales incorrectas");
    }

    const isValidPassword = await verifyPassword(user.usuario_password, password);
    if (!isValidPassword) {
      throw new Error("Credenciales incorrectas");
    }

    // 2. Get active role
    const userWithRole = await this.userRepo.findWithActiveRole(user.usuario_id);
    if (!userWithRole) {
      throw new Error("Usuario sin rol activo");
    }

    // Check for multiple active roles
    const activeRoleCount = await this.userRepo.getActiveRoleCount(user.usuario_id);
    if (activeRoleCount > 1) {
      throw new Error("Usuario tiene múltiples roles activos. Contacte al administrador.");
    }

    // 3. Get session policy
    const policyId = userWithRole.politica_sesion_id || userWithRole.session_policy_id || 1;
    const policy = await this.sessionRepo.getSessionPolicy(policyId);
    if (!policy) {
      throw new Error("Política de sesión no encontrada");
    }

    // 4. Create session
    const sessionId = randomUUID();
    const refreshJti = generateJTI();
    const refreshTokenHash = await hashPassword(refreshJti);
    
    const expiresAt = new Date(
      Date.now() + (policy.tiempo_expiracion_sesion * 60 * 1000)
    );

    await this.sessionRepo.createSession({
      sesion_id: sessionId,
      usuario_id: user.usuario_id,
      rol_usuario_id: userWithRole.activeRole.rol_id,
      policy_id: policyId,
      refresh_jti: refreshJti,
      refresh_token_hash: refreshTokenHash,
      expires_at_absolute: expiresAt,
      ip: clientInfo?.ip,
      user_agent: clientInfo?.userAgent,
      device_info: clientInfo?.deviceInfo,
    });

    // 5. Get user permissions and menu
    const permissions = await this.rbacRepo.getUserPermissions(user.usuario_id);
    const defaultModule = await this.rbacRepo.getDefaultModuleForUser(user.usuario_id);
    const menu = await this.rbacRepo.getMenuForUser(user.usuario_id);

    // 6. Create tokens
    const accessToken = await createAccessToken({
      sub: user.usuario_id,
      sid: sessionId,
      rid: userWithRole.activeRole.rol_id,
      permissions,
    });

    const refreshToken = await createRefreshToken({
      sub: user.usuario_id,
      sid: sessionId,
      rid: userWithRole.activeRole.rol_id,
      jti: refreshJti,
    });

    const authResponse: AuthResponse = {
      accessToken,
      user: {
        usuario_id: user.usuario_id,
        usuario: user.usuario,
        individuo: user.individuo || undefined,
        usuario_habilitado: user.usuario_habilitado,
        rol_activo: userWithRole.activeRole,
      },
      roleId: userWithRole.activeRole.rol_id,
      defaultModule: defaultModule || menu[0],
      menu,
    };

    return { authResponse, refreshToken };
  }

  async refresh(refreshToken: string): Promise<{ authResponse: AuthResponse; newRefreshToken: string }> {
    // 1. Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    
    // 2. Check session exists and is valid
    const session = await this.sessionRepo.findActiveSessionByJti(payload.jti);
    if (!session || session.revoked) {
      throw new Error("Sesión inválida");
    }

    // 3. Check absolute expiration
    if (new Date() > session.expires_at_absolute) {
      await this.sessionRepo.revokeSession(session.sesion_id);
      throw new Error("Sesión expirada");
    }

    // 4. Check inactivity expiration
    const isInactive = await this.sessionRepo.isSessionExpiredByInactivity(session.sesion_id);
    if (isInactive) {
      await this.sessionRepo.revokeSession(session.sesion_id);
      throw new Error("Sesión inactiva");
    }

    // 5. Rotate refresh token
    const newJti = generateJTI();
    const newTokenHash = await hashPassword(newJti);
    
    await this.sessionRepo.rotateRefreshToken(session.sesion_id, newJti, newTokenHash);

    // 6. Get current user and permissions
    const userWithRole = await this.userRepo.findWithActiveRole(session.usuario_id);
    if (!userWithRole) {
      throw new Error("Usuario no encontrado");
    }

    const permissions = await this.rbacRepo.getUserPermissions(session.usuario_id);
    const defaultModule = await this.rbacRepo.getDefaultModuleForUser(session.usuario_id);
    const menu = await this.rbacRepo.getMenuForUser(session.usuario_id);

    // 7. Create new tokens
    const accessToken = await createAccessToken({
      sub: session.usuario_id,
      sid: session.sesion_id,
      rid: userWithRole.activeRole.rol_id,
      permissions,
    });

    const newRefreshToken = await createRefreshToken({
      sub: session.usuario_id,
      sid: session.sesion_id,
      rid: userWithRole.activeRole.rol_id,
      jti: newJti,
    });

    const authResponse: AuthResponse = {
      accessToken,
      user: {
        usuario_id: userWithRole.usuario_id,
        usuario: userWithRole.usuario,
        individuo: userWithRole.individuo,
        usuario_habilitado: userWithRole.usuario_habilitado,
        rol_activo: userWithRole.activeRole,
      },
      roleId: userWithRole.activeRole.rol_id,
      defaultModule: defaultModule || menu[0],
      menu,
    };

    return { authResponse, newRefreshToken };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionRepo.revokeSession(sessionId);
  }
}
