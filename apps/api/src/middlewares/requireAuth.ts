import type { Response, NextFunction } from "express";
import { verifyAccessToken } from "../auth/token.js";
import { SessionRepository } from "../repositories/session.repo.js";
import { RbacRepository } from "../repositories/rbac.repo.js";
import { SessionService } from "../services/session.service.js";
import type { AuthRequest } from "../types/auth.js";

const sessionRepo = new SessionRepository();
const rbacRepo = new RbacRepository();
const sessionService = new SessionService(sessionRepo);

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        ok: false, 
        code: "MISSING_TOKEN", 
        message: "Token de acceso requerido" 
      });
    }

    const token = authHeader.slice(7);
    
    // Verify and decrypt access token
    const payload = await verifyAccessToken(token);
    
    // Check session is still valid
    const session = await sessionRepo.findSessionById(payload.sid);
    if (!session || session.revoked) {
      return res.status(401).json({ 
        ok: false, 
        code: "INVALID_SESSION", 
        message: "Sesión inválida" 
      });
    }

    // Check absolute expiration
    if (new Date() > session.expires_at_absolute) {
      await sessionRepo.revokeSession(session.sesion_id);
      return res.status(401).json({ 
        ok: false, 
        code: "SESSION_EXPIRED", 
        message: "Sesión expirada" 
      });
    }

    // Check inactivity expiration
    const isInactive = await sessionRepo.isSessionExpiredByInactivity(session.sesion_id);
    if (isInactive) {
      await sessionRepo.revokeSession(session.sesion_id);
      return res.status(401).json({ 
        ok: false, 
        code: "SESSION_INACTIVE", 
        message: "Sesión inactiva" 
      });
    }

    // Update session activity if needed
    await sessionService.updateActivityIfNeeded(session.sesion_id);

    // Get fresh permissions
    const permissions = await rbacRepo.getUserPermissions(payload.sub);

    // Attach auth info to request
    req.auth = {
      userId: payload.sub,
      roleId: payload.rid,
      sid: payload.sid,
      permissions,
    };

    next();
  } catch (error) {
    return res.status(401).json({ 
      ok: false, 
      code: "INVALID_TOKEN", 
      message: "Token de acceso inválido" 
    });
  }
}
