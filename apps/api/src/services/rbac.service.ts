import { RbacRepository } from "../repositories/rbac.repo.js";
import type { Module } from "@shared/index";

export class RbacService {
  constructor(private rbacRepo: RbacRepository) {}

  async getMenuForUser(userId: number): Promise<Module[]> {
    return await this.rbacRepo.getMenuForUser(userId);
  }

  async hasPermission(userId: number, module: string, permission: string): Promise<boolean> {
    return await this.rbacRepo.hasPermission(userId, module, permission);
  }

  requirePermission(module: string, permission: string = "ingresar") {
    return async (userId: number): Promise<boolean> => {
      return await this.hasPermission(userId, module, permission);
    };
  }
}
