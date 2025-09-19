import { z } from "zod";

// DTOs and Validation Schemas
export const loginSchema = z.object({
  usuario: z.string().min(1, "Usuario es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
});

export const createUserSchema = z.object({
  firstName: z.string().min(1, "Nombre es requerido"),
  lastName: z.string().min(1, "Apellido es requerido"),
  document: z.string().min(8, "Documento debe tener al menos 8 dígitos"),
  secondLastName: z.string().optional(),
  password: z.string().min(8, "Contraseña debe tener al menos 8 caracteres"),
  roles: z.array(z.number()).min(1, "Debe seleccionar al menos un rol").max(2, "Máximo 2 roles permitidos"),
  activeRole: z.number(),
  sessionPolicyId: z.number(),
  allowMultipleSessions: z.boolean().default(false),
  enabled: z.boolean().default(true),
});

export const checkUsernameSchema = z.object({
  u: z.string().min(1),
});

// Types
export type LoginDto = z.infer<typeof loginSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type CheckUsernameDto = z.infer<typeof checkUsernameSchema>;

// Response Types
export interface AuthResponse {
  user: UserProfile;
  roleId: number;
  defaultModule: Module;
  menu: Module[];
}

export interface UserProfile {
  usuario_id: number;
  usuario: string;
  individuo?: string;
  nombre_completo?: string;
  usuario_habilitado: boolean;
  rol_activo: {
    rol_id: number;
    descripcion: string;
  };
}

export interface Module {
  modulo_id: number;
  label: string;
  path: string;
  icon: string;
  isDefault: boolean;
  permisos: Permission[];
  children?: Module[];
}

export interface Permission {
  permiso_id: number;
  descripcion: string;
  habilitado: boolean;
}

export interface Session {
  sesion_id: string;
  usuario_id: number;
  rol_usuario_id: number;
  policy_id: number;
  refresh_jti: string;
  refresh_token_hash: string;
  created_at: Date;
  last_activity: Date;
  expires_at_absolute: Date;
  revoked: boolean;
  revoked_at?: Date;
  device_info?: any;
  ip?: string;
  user_agent?: string;
  persona_snapshot?: any;
  meta?: any;
}

// Enums
export enum PermissionAction {
  INGRESAR = "ingresar",
  CREAR = "crear",
  EDITAR = "editar",
  ELIMINAR = "eliminar",
}

export enum SessionStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REVOKED = "revoked",
  INACTIVE = "inactive",
}
