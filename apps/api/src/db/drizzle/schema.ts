import { 
  pgTable, 
  uuid, 
  bigserial, 
  serial, 
  varchar, 
  boolean, 
  integer, 
  timestamp, 
  text, 
  jsonb, 
  bigint 
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Sesiones table
export const sesiones = pgTable("sesiones", {
  sesion_id: uuid("sesion_id").primaryKey().defaultRandom(),
  usuario_id: bigint("usuario_id", { mode: "number" }).notNull(),
  rol_usuario_id: integer("rol_usuario_id").notNull(),
  policy_id: integer("policy_id").notNull(),
  refresh_jti: varchar("refresh_jti").notNull(),
  refresh_token_hash: varchar("refresh_token_hash").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  last_activity: timestamp("last_activity").defaultNow().notNull(),
  expires_at_absolute: timestamp("expires_at_absolute").notNull(),
  revoked: boolean("revoked").default(false).notNull(),
  revoked_at: timestamp("revoked_at"),
  device_info: jsonb("device_info"),
  ip: varchar("ip", { length: 45 }),
  user_agent: text("user_agent"),
  persona_snapshot: jsonb("persona_snapshot"),
  meta: jsonb("meta"),
});

// Políticas de sesión
export const politicas_sesion = pgTable("politicas_sesion", {
  politica_sesion_id: integer("politica_sesion_id").primaryKey(),
  tiempo_inactividad_sesion: integer("tiempo_inactividad_sesion").notNull(),
  tiempo_expiracion_sesion: integer("tiempo_expiracion_sesion").notNull(),
  tiempo_refrescamiento_token: integer("tiempo_refrescamiento_token").notNull(),
  fecha_hora_creacion: timestamp("fecha_hora_creacion").defaultNow().notNull(),
  fecha_hora_actualizacion: timestamp("fecha_hora_actualizacion").defaultNow().notNull(),
});

// Usuarios
export const usuarios = pgTable("usuarios", {
  usuario_id: bigserial("usuario_id", { mode: "number" }).primaryKey(),
  individuo: uuid("individuo"),
  usuario: varchar("usuario", { length: 50 }).unique().notNull(),
  usuario_password: varchar("usuario_password", { length: 255 }).notNull(),
  usuario_tema: varchar("usuario_tema", { length: 20 }),
  usuario_habilitado: boolean("usuario_habilitado").default(true).notNull(),
  politica_sesion_id: integer("politica_sesion_id"),
  usuario_access_token: varchar("usuario_access_token", { length: 255 }),
  usuario_sesion_multiple: boolean("usuario_sesion_multiple").default(false).notNull(),
  usuario_expirado: boolean("usuario_expirado").default(false).notNull(),
  usuario_expiracion: integer("usuario_expiracion"),
  session_policy_id: integer("session_policy_id"),
});

// Roles
export const roles = pgTable("roles", {
  rol_id: serial("rol_id").primaryKey(),
  rol_descripcion: varchar("rol_descripcion", { length: 150 }).notNull(),
  rol_habilitado: boolean("rol_habilitado").default(true).notNull(),
});

// Rol Usuario (junction table)
export const rol_usuario = pgTable("rol_usuario", {
  rol: integer("rol").notNull(),
  usuario: integer("usuario").notNull(),
  rol_usuario_especial: boolean("rol_usuario_especial").default(false).notNull(),
  rol_usuario_habilitado: boolean("rol_usuario_habilitado").default(true).notNull(),
});

// Módulos
export const modulos = pgTable("modulos", {
  modulo_id: serial("modulo_id").primaryKey(),
  modulo_descripcion: varchar("modulo_descripcion", { length: 150 }).notNull(),
  modulo_key: varchar("modulo_key", { length: 50 }),
  modulo_icono: varchar("modulo_icono", { length: 100 }),
  modulo_habilitado: boolean("modulo_habilitado").default(true).notNull(),
  modulo_padre_id: integer("modulo_padre_id"),
  modulo_ruta: varchar("modulo_ruta").notNull(),
});

// Rol Módulo (junction table)
export const rol_modulo = pgTable("rol_modulo", {
  modulo_id: integer("modulo_id").notNull(),
  rol_id: integer("rol_id").notNull(),
  rol_modulo_habilitado: boolean("rol_modulo_habilitado").default(true).notNull(),
  modulo_default: boolean("modulo_default").default(false).notNull(),
});

// Permisos
export const permisos = pgTable("permisos", {
  permiso_id: bigint("permiso_id", { mode: "number" }).primaryKey(),
  permiso_descripcion: varchar("permiso_descripcion", { length: 100 }).notNull(),
  permiso_key: varchar("permiso_key", { length: 50 }),
  permiso_habilitado: boolean("permiso_habilitado").default(true).notNull(),
});

// Rol Módulo Permiso (junction table)
export const rol_modulo_permiso = pgTable("rol_modulo_permiso", {
  modulo_id: integer("modulo_id").notNull(),
  permiso_id: bigint("permiso_id", { mode: "number" }).notNull(),
  rol_id: integer("rol_id").notNull(),
  rol_modulo_permiso_habilitado: boolean("rol_modulo_permiso_habilitado").default(true).notNull(),
});

// Relations
export const usuariosRelations = relations(usuarios, ({ many, one }) => ({
  roles: many(rol_usuario),
  sesiones: many(sesiones),
  politica_sesion: one(politicas_sesion, {
    fields: [usuarios.politica_sesion_id],
    references: [politicas_sesion.politica_sesion_id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  usuarios: many(rol_usuario),
  modulos: many(rol_modulo),
  permisos: many(rol_modulo_permiso),
}));

export const modulosRelations = relations(modulos, ({ many, one }) => ({
  roles: many(rol_modulo),
  permisos: many(rol_modulo_permiso),
  padre: one(modulos, {
    fields: [modulos.modulo_padre_id],
    references: [modulos.modulo_id],
  }),
  hijos: many(modulos),
}));

export const sesionesRelations = relations(sesiones, ({ one }) => ({
  usuario: one(usuarios, {
    fields: [sesiones.usuario_id],
    references: [usuarios.usuario_id],
  }),
  politica: one(politicas_sesion, {
    fields: [sesiones.policy_id],
    references: [politicas_sesion.politica_sesion_id],
  }),
}));
