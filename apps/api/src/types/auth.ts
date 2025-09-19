import type { Request } from "express";

export interface AuthRequest extends Request {
  auth?: {
    userId: number;
    roleId: number;
    sid: string;
    permissions: string[];
  };
}

export interface SessionPolicy {
  politica_sesion_id: number;
  tiempo_inactividad_sesion: number;
  tiempo_expiracion_sesion: number;
  tiempo_refrescamiento_token: number;
}

export interface UserWithRole {
  usuario_id: number;
  usuario: string;
  individuo?: string;
  usuario_habilitado: boolean;
  politica_sesion_id?: number;
  session_policy_id?: number;
  activeRole: {
    rol_id: number;
    descripcion: string;
  };
}
