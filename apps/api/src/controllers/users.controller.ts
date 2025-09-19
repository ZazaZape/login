import type { Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import { UserRepository } from "../repositories/user.repo.js";
import { checkUsernameSchema, createUserSchema } from "@shared/index";
import type { AuthRequest } from "../types/auth.js";

const userRepo = new UserRepository();
const userService = new UserService(userRepo);

export async function checkUsername(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const validation = checkUsernameSchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Parámetros inválidos",
      });
    }

    const { u: username } = validation.data;
    const result = await userService.checkUsernameAvailability(username);

    if (!result.available) {
      return res.status(409).json({
        ok: false,
        code: "USERNAME_TAKEN",
        message: "El usuario ya existe",
        available: false,
      });
    }

    res.json({
      ok: true,
      available: true,
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Datos inválidos",
        errors: validation.error.errors,
      });
    }

    const userData = validation.data;
    
    await userService.createUser(userData);

    res.status(201).json({
      ok: true,
      message: "Usuario creado exitosamente",
    });
  } catch (error: any) {
    if (error?.message === "El usuario ya existe") {
      return res.status(409).json({
        ok: false,
        code: "USERNAME_TAKEN",
        message: error?.message || "Error desconocido",
      });
    }
    next(error);
  }
}

export async function getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await userRepo.findAllUsers();
    
    res.json({
      ok: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}
