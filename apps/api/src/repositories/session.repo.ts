import { db } from "../db/client.js";
import { sesiones, politicas_sesion } from "../db/drizzle/schema.js";
import { eq, and, lt, gt } from "drizzle-orm";
import type { SessionPolicy } from "../types/auth.js";

export class SessionRepository {
  async createSession(sessionData: {
    sesion_id: string;
    usuario_id: number;
    rol_usuario_id: number;
    policy_id: number;
    refresh_jti: string;
    refresh_token_hash: string;
    expires_at_absolute: Date;
    ip?: string;
    user_agent?: string;
    device_info?: any;
    persona_snapshot?: any;
  }) {
    const result = await db
      .insert(sesiones)
      .values(sessionData)
      .returning();

    return result[0];
  }

  async findSessionById(sessionId: string) {
    const result = await db
      .select()
      .from(sesiones)
      .where(eq(sesiones.sesion_id, sessionId))
      .limit(1);

    return result[0] || null;
  }

  async findActiveSessionByJti(jti: string) {
    const result = await db
      .select()
      .from(sesiones)
      .where(
        and(
          eq(sesiones.refresh_jti, jti),
          eq(sesiones.revoked, false)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  async updateSessionActivity(sessionId: string) {
    const result = await db
      .update(sesiones)
      .set({ last_activity: new Date() })
      .where(eq(sesiones.sesion_id, sessionId))
      .returning();

    return result[0] || null;
  }

  async rotateRefreshToken(sessionId: string, newJti: string, newTokenHash: string) {
    const result = await db
      .update(sesiones)
      .set({
        refresh_jti: newJti,
        refresh_token_hash: newTokenHash,
        last_activity: new Date(),
      })
      .where(eq(sesiones.sesion_id, sessionId))
      .returning();

    return result[0] || null;
  }

  async revokeSession(sessionId: string) {
    const result = await db
      .update(sesiones)
      .set({
        revoked: true,
        revoked_at: new Date(),
      })
      .where(eq(sesiones.sesion_id, sessionId))
      .returning();

    return result[0] || null;
  }

  async revokeAllUserSessions(userId: number) {
    await db
      .update(sesiones)
      .set({
        revoked: true,
        revoked_at: new Date(),
      })
      .where(eq(sesiones.usuario_id, userId));
  }

  async getSessionPolicy(policyId: number): Promise<SessionPolicy | null> {
    const result = await db
      .select()
      .from(politicas_sesion)
      .where(eq(politicas_sesion.politica_sesion_id, policyId))
      .limit(1);

    return result[0] || null;
  }

  async cleanupExpiredSessions() {
    const now = new Date();
    
    // Mark sessions as revoked if they're past absolute expiration
    await db
      .update(sesiones)
      .set({
        revoked: true,
        revoked_at: now,
      })
      .where(
        and(
          eq(sesiones.revoked, false),
          lt(sesiones.expires_at_absolute, now)
        )
      );
  }

  async isSessionExpiredByInactivity(sessionId: string): Promise<boolean> {
    const sessionWithPolicy = await db
      .select({
        last_activity: sesiones.last_activity,
        tiempo_inactividad_sesion: politicas_sesion.tiempo_inactividad_sesion,
      })
      .from(sesiones)
      .innerJoin(politicas_sesion, eq(sesiones.policy_id, politicas_sesion.politica_sesion_id))
      .where(eq(sesiones.sesion_id, sessionId))
      .limit(1);

    if (!sessionWithPolicy[0]) return true;

    const { last_activity, tiempo_inactividad_sesion } = sessionWithPolicy[0];
    const inactivityThreshold = new Date(
      last_activity.getTime() + (tiempo_inactividad_sesion * 60 * 1000)
    );

    return new Date() > inactivityThreshold;
  }
}
