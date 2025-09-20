import type { Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { UserRepository } from "../repositories/user.repo.js";
import { SessionRepository } from "../repositories/session.repo.js";
import { RbacRepository } from "../repositories/rbac.repo.js";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../auth/cookies.js";
import { loginSchema } from "@shared/index";
import type { AuthRequest } from "../types/auth.js";

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();
const rbacRepo = new RbacRepository();
const authService = new AuthService(userRepo, sessionRepo, rbacRepo);

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Datos inválidos",
        errors: validation.error.errors,
      });
    }

    const { usuario, password } = validation.data;
    
    const clientInfo = {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      deviceInfo: {
        platform: req.get("sec-ch-ua-platform"),
        mobile: req.get("sec-ch-ua-mobile"),
      },
    };

    const { authResponse, refreshToken } = await authService.login(
      usuario, 
      password, 
      clientInfo
    );

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      ok: true,
      data: authResponse,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Debug logging
    console.log('[DEBUG] Refresh request headers:', req.headers.cookie);
    console.log('[DEBUG] req.cookies object:', req.cookies);
    console.log('[DEBUG] Available cookie keys:', req.cookies ? Object.keys(req.cookies) : 'undefined');
    
    const refreshToken = req.cookies?.refresh_token;
    console.log('[DEBUG] Extracted refresh_token:', refreshToken ? 'present' : 'missing');
    
    if (!refreshToken) {
      return res.status(401).json({
        ok: false,
        code: "MISSING_REFRESH_TOKEN",
        message: "Token de refresco requerido",
      });
    }

    const { authResponse, newRefreshToken } = await authService.refresh(refreshToken);

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      ok: true,
      data: authResponse,
    });
  } catch (error) {
    clearRefreshTokenCookie(res);
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.auth?.sid) {
      await authService.logout(req.auth.sid);
    }

    clearRefreshTokenCookie(res);

    res.json({
      ok: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({
        ok: false,
        code: "UNAUTHORIZED",
        message: "No autenticado",
      });
    }

    const userWithRole = await userRepo.findWithActiveRole(req.auth.userId);
    if (!userWithRole) {
      return res.status(404).json({
        ok: false,
        code: "USER_NOT_FOUND",
        message: "Usuario no encontrado",
      });
    }

    const defaultModule = await rbacRepo.getDefaultModuleForUser(req.auth.userId);
    const menu = await rbacRepo.getMenuForUser(req.auth.userId);

    const authResponse = {
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

    res.json({
      ok: true,
      data: authResponse,
    });
  } catch (error) {
    next(error);
  }
}
