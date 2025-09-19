import type { Response, NextFunction } from "express";
import { RbacService } from "../services/rbac.service.js";
import { RbacRepository } from "../repositories/rbac.repo.js";
import type { AuthRequest } from "../types/auth.js";

const rbacRepo = new RbacRepository();
const rbacService = new RbacService(rbacRepo);

export async function getMenu(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.auth) {
      return res.status(401).json({
        ok: false,
        code: "UNAUTHORIZED",
        message: "No autenticado",
      });
    }

    const menu = await rbacService.getMenuForUser(req.auth.userId);

    res.json({
      ok: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
}
