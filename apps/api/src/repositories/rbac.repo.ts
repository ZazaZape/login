import { db } from "../db/client.js";
import { 
  modulos, 
  rol_modulo, 
  rol_usuario, 
  permisos, 
  rol_modulo_permiso 
} from "../db/drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import type { Module, Permission } from "@shared/index";

export class RbacRepository {
  async getDefaultModuleForUser(userId: number): Promise<Module | null> {
    const result = await db
      .select({
        modulo_id: modulos.modulo_id,
        modulo_descripcion: modulos.modulo_descripcion,
        modulo_ruta: modulos.modulo_ruta,
        modulo_icono: modulos.modulo_icono,
      })
      .from(modulos)
      .innerJoin(rol_modulo, and(
        eq(rol_modulo.modulo_id, modulos.modulo_id),
        eq(rol_modulo.modulo_default, true),
        eq(rol_modulo.rol_modulo_habilitado, true)
      ))
      .innerJoin(rol_usuario, and(
        eq(rol_usuario.rol, rol_modulo.rol_id),
        eq(rol_usuario.rol_usuario_habilitado, true)
      ))
      .where(eq(rol_usuario.usuario, userId))
      .limit(1);

    if (!result[0]) return null;

    const module = result[0];
    return {
      modulo_id: module.modulo_id,
      label: module.modulo_descripcion,
      path: module.modulo_ruta,
      icon: module.modulo_icono || "",
      isDefault: true,
      permisos: [],
    };
  }

  async getMenuForUser(userId: number): Promise<Module[]> {
    // Get all modules for user's active role with permissions
    const result = await db
      .select({
        modulo_id: modulos.modulo_id,
        modulo_descripcion: modulos.modulo_descripcion,
        modulo_ruta: modulos.modulo_ruta,
        modulo_icono: modulos.modulo_icono,
        modulo_padre_id: modulos.modulo_padre_id,
        modulo_default: rol_modulo.modulo_default,
        permiso_id: permisos.permiso_id,
        permiso_descripcion: permisos.permiso_descripcion,
        permiso_habilitado: rol_modulo_permiso.rol_modulo_permiso_habilita,
      })
      .from(modulos)
      .innerJoin(rol_modulo, and(
        eq(rol_modulo.modulo_id, modulos.modulo_id),
        eq(rol_modulo.rol_modulo_habilitado, true)
      ))
      .innerJoin(rol_usuario, and(
        eq(rol_usuario.rol, rol_modulo.rol_id),
        eq(rol_usuario.rol_usuario_habilitado, true)
      ))
      .leftJoin(rol_modulo_permiso, and(
        eq(rol_modulo_permiso.modulo_id, modulos.modulo_id),
        eq(rol_modulo_permiso.rol_id, rol_usuario.rol)
      ))
      .leftJoin(permisos, eq(permisos.permiso_id, rol_modulo_permiso.permiso_id))
      .where(and(
        eq(rol_usuario.usuario, userId),
        eq(modulos.modulo_habilitado, true)
      ));

    // Group results by module
    const moduleMap = new Map<number, Module>();

    result.forEach(row => {
      const moduleId = row.modulo_id;
      
      if (!moduleMap.has(moduleId)) {
        moduleMap.set(moduleId, {
          modulo_id: row.modulo_id,
          label: row.modulo_descripcion,
          path: row.modulo_ruta,
          icon: row.modulo_icono || "",
          isDefault: row.modulo_default || false,
          permisos: [],
        });
      }

      const module = moduleMap.get(moduleId)!;
      
      if (row.permiso_id) {
        module.permisos.push({
          permiso_id: row.permiso_id,
          descripcion: row.permiso_descripcion || "",
          habilitado: row.permiso_habilitado || false,
        });
      }
    });

    return Array.from(moduleMap.values()).sort((a, b) => 
      a.label.localeCompare(b.label)
    );
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const result = await db
      .select({
        permiso_descripcion: permisos.permiso_descripcion,
        modulo_descripcion: modulos.modulo_descripcion,
      })
      .from(permisos)
      .innerJoin(rol_modulo_permiso, and(
        eq(rol_modulo_permiso.permiso_id, permisos.permiso_id),
        eq(rol_modulo_permiso.rol_modulo_permiso_habilita, true)
      ))
      .innerJoin(modulos, eq(modulos.modulo_id, rol_modulo_permiso.modulo_id))
      .innerJoin(rol_usuario, and(
        eq(rol_usuario.rol, rol_modulo_permiso.rol_id),
        eq(rol_usuario.rol_usuario_habilitado, true)
      ))
      .where(eq(rol_usuario.usuario, userId));

    return result.map(row => 
      `${row.modulo_descripcion.toLowerCase()}.${row.permiso_descripcion.toLowerCase()}`
    );
  }

  async hasPermission(userId: number, module: string, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    const requiredPermission = `${module.toLowerCase()}.${permission.toLowerCase()}`;
    return permissions.includes(requiredPermission);
  }
}
