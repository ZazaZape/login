import { SessionRepository } from "../repositories/session.repo.js";
import { constants } from "@config/index";

export class SessionService {
  constructor(private sessionRepo: SessionRepository) {}

  async updateActivityIfNeeded(sessionId: string): Promise<void> {
    const session = await this.sessionRepo.findSessionById(sessionId);
    if (!session) return;

    const now = new Date();
    const lastActivity = new Date(session.last_activity);
    const secondsSinceLastActivity = (now.getTime() - lastActivity.getTime()) / 1000;

    if (secondsSinceLastActivity >= constants.SESSION_UPDATE_THRESHOLD_SEC) {
      await this.sessionRepo.updateSessionActivity(sessionId);
    }
  }

  async cleanupExpiredSessions(): Promise<void> {
    await this.sessionRepo.cleanupExpiredSessions();
  }
}
