import { UserRepository } from "../repositories/user.repo.js";
import { SessionRepository } from "../repositories/session.repo.js";
import { hashPassword } from "../utils/password.js";
import type { CreateUserDto } from "@shared/index";

export class UserService {
  constructor(
    private userRepo: UserRepository,
    private sessionRepo: SessionRepository
  ) {}

  async checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
    const available = await this.userRepo.checkUsernameAvailability(username);
    return { available };
  }

  async createUser(userData: CreateUserDto): Promise<void> {
    // Generate username
    const username = this.buildUsername(userData.firstName, userData.lastName, userData.document);
    
    // Check username availability again to prevent race conditions
    const available = await this.userRepo.checkUsernameAvailability(username);
    if (!available) {
      throw new Error("El usuario ya existe");
    }

    // Validate role assignments
    if (userData.roles.length > 2) {
      throw new Error("Máximo 2 roles permitidos");
    }

    if (!userData.roles.includes(userData.activeRole)) {
      throw new Error("El rol activo debe estar incluido en los roles asignados");
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = await this.userRepo.createUser({
      usuario: username,
      usuario_password: hashedPassword,
      politica_sesion_id: userData.sessionPolicyId,
      usuario_sesion_multiple: userData.allowMultipleSessions,
      usuario_habilitado: userData.enabled,
    });

    // Assign roles
    const roleAssignments = userData.roles.map(roleId => ({
      rol_id: roleId,
      active: roleId === userData.activeRole,
    }));

    await this.userRepo.assignRoles(user.usuario_id, roleAssignments);
  }

  buildUsername(firstName: string, lastName: string, document: string): string {
    if (!firstName || !lastName || !document || document.length < 4) {
      throw new Error("Datos insuficientes para generar usuario");
    }

    const firstLetter = firstName.trim().charAt(0).toLowerCase();
    const cleanLastName = lastName.trim().toLowerCase();
    const lastFourDigits = document.slice(-4);

    return (firstLetter + cleanLastName + lastFourDigits)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, ''); // Remove non-alphanumeric characters
  }

  async updateUserStatus(userId: number, enabled: boolean): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Update user status
    await this.userRepo.updateUserStatus(userId, enabled);
    
    // If disabling user, revoke all active sessions for security
    if (!enabled) {
      await this.sessionRepo.revokeAllUserSessions(userId);
    }
  }
}
