// File-based session store for persistence across server restarts
// In production, this should be replaced with Redis, database, or other persistent storage

import fs from 'fs';
import path from 'path';

interface SessionData {
  email: string;
  userType: 'freelancer' | 'client';
  createdAt: number;
  expiresAt: number;
}

class SessionStore {
  private sessions: Map<string, SessionData> = new Map();
  private sessionsFile: string;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Create sessions directory if it doesn't exist
    const sessionsDir = path.join(process.cwd(), '.sessions');
    if (!fs.existsSync(sessionsDir)) {
      fs.mkdirSync(sessionsDir, { recursive: true });
    }
    
    this.sessionsFile = path.join(sessionsDir, 'sessions.json');
    
    // Load existing sessions from file
    this.loadSessions();
    
    // Clean up expired sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  private loadSessions(): void {
    try {
      if (fs.existsSync(this.sessionsFile)) {
        const data = fs.readFileSync(this.sessionsFile, 'utf8');
        const sessionsData = JSON.parse(data);
        
        // Convert back to Map and filter out expired sessions
        const now = Date.now();
        for (const [sessionId, sessionData] of Object.entries(sessionsData)) {
          if (now < (sessionData as SessionData).expiresAt) {
            this.sessions.set(sessionId, sessionData as SessionData);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load sessions from file:', error);
    }
  }

  private saveSessions(): void {
    try {
      const sessionsData = Object.fromEntries(this.sessions);
      fs.writeFileSync(this.sessionsFile, JSON.stringify(sessionsData, null, 2));
    } catch (error) {
      console.warn('Failed to save sessions to file:', error);
    }
  }

  createSession(sessionId: string, email: string, userType: 'freelancer' | 'client'): void {
    const now = Date.now();
    const expiresAt = now + (7 * 24 * 60 * 60 * 1000); // 7 days

    this.sessions.set(sessionId, {
      email,
      userType,
      createdAt: now,
      expiresAt
    });
    
    this.saveSessions();
  }

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      this.saveSessions();
      return null;
    }

    return session;
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.saveSessions();
  }

  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let hasChanges = false;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      this.saveSessions();
    }
  }

  // Get session count for monitoring
  getSessionCount(): number {
    return this.sessions.size;
  }

  // Get all active sessions (for debugging)
  getAllSessions(): Array<{ sessionId: string; data: SessionData }> {
    return Array.from(this.sessions.entries()).map(([sessionId, data]) => ({
      sessionId,
      data
    }));
  }
}

// Export a singleton instance
export const sessionStore = new SessionStore();
