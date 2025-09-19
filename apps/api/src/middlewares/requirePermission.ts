import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../types/auth.js";

export function requirePermission(module: string, permission: string = "ingresar") {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ 
        ok: false, 
        code: "UNAUTHORIZED", 
        message: "No autenticado" 
      });
    }

    const requiredPermission = `${module.toLowerCase()}.${permission.toLowerCase()}`;
    const hasPermission = req.auth.permissions.includes(requiredPermission);

    if (!hasPermission) {
      return res.status(403).json({ 
        ok: false, 
        code: "FORBIDDEN", 
        message: "Permisos insuficientes" 
      });
    }

    next();
  };
}
