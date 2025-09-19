import { z } from "zod";

// Validation schemas for user management
export const checkUsernameSchema = z.object({
  u: z.string().min(1, "Username is required"),
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

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type CheckUsernameDto = z.infer<typeof checkUsernameSchema>;