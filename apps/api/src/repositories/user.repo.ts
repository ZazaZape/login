import { db } from "../db/client.js";
import { usuarios, roles, rol_usuario } from "../db/drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import type { UserWithRole } from "../types/auth.js";

export class UserRepository {
  async findByUsername(username: string) {
    const result = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.usuario, username))
      .limit(1);

    return result[0] || null;
  }

  async findById(userId: number) {
    const result = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.usuario_id, userId))
      .limit(1);

    return result[0] || null;
  }

  async findWithActiveRole(userId: number): Promise<UserWithRole | null> {
    const result = await db
      .select({
        usuario_id: usuarios.usuario_id,
        usuario: usuarios.usuario,
        individuo: usuarios.individuo,
        usuario_habilitado: usuarios.usuario_habilitado,
        politica_sesion_id: usuarios.politica_sesion_id,
        session_policy_id: usuarios.session_policy_id,
        rol_id: roles.rol_id,
        rol_descripcion: roles.rol_descripcion,
      })
      .from(usuarios)
      .innerJoin(rol_usuario, eq(usuarios.usuario_id, rol_usuario.usuario))
      .innerJoin(roles, eq(rol_usuario.rol, roles.rol_id))
      .where(
        and(
          eq(usuarios.usuario_id, userId),
          eq(rol_usuario.rol_usuario_habilitado, true),
          eq(roles.rol_habilitado, true)
        )
      )
      .limit(1);

    if (!result[0]) return null;

    const user = result[0];
    return {
      usuario_id: user.usuario_id,
      usuario: user.usuario,
      individuo: user.individuo || undefined,
      usuario_habilitado: user.usuario_habilitado,
      politica_sesion_id: user.politica_sesion_id || undefined,
      session_policy_id: user.session_policy_id || undefined,
      activeRole: {
        rol_id: user.rol_id,
        descripcion: user.rol_descripcion,
      },
    };
  }

  async checkUsernameAvailability(username: string): Promise<boolean> {
    const result = await db
      .select({ count: usuarios.usuario_id })
      .from(usuarios)
      .where(eq(usuarios.usuario, username))
      .limit(1);

    return result.length === 0;
  }

  async createUser(userData: {
    usuario: string;
    usuario_password: string;
    individuo?: string;
    politica_sesion_id?: number;
    usuario_sesion_multiple?: boolean;
    usuario_habilitado?: boolean;
  }) {
    const result = await db
      .insert(usuarios)
      .values(userData)
      .returning();

    return result[0];
  }

  async assignRoles(userId: number, roleAssignments: Array<{ rol_id: number; active: boolean }>) {
    // First, remove existing role assignments
    await db
      .delete(rol_usuario)
      .where(eq(rol_usuario.usuario, userId));

    // Then insert new assignments
    const assignments = roleAssignments.map(assignment => ({
      usuario: userId,
      rol: assignment.rol_id,
      rol_usuario_habilitado: assignment.active,
      rol_usuario_especial: false,
    }));

    if (assignments.length > 0) {
      await db.insert(rol_usuario).values(assignments);
    }
  }

  async getActiveRoleCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: rol_usuario.rol })
      .from(rol_usuario)
      .where(
        and(
          eq(rol_usuario.usuario, userId),
          eq(rol_usuario.rol_usuario_habilitado, true)
        )
      );

    return result.length;
  }
}
