import { Session } from '../types';

const STORAGE_KEY = 'word_editor_sessions';

export function getSessions(): Session[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const sessions = JSON.parse(stored);
    return sessions.map((s: any) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt)
    }));
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  const sessions = getSessions();
  const existingIndex = sessions.findIndex(s => s.id === session.id);
  
  if (existingIndex >= 0) {
    sessions[existingIndex] = session;
  } else {
    sessions.unshift(session);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function deleteSession(sessionId: string): void {
  const sessions = getSessions().filter(s => s.id !== sessionId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function getCurrentSession(): Session | null {
  const sessionId = sessionStorage.getItem('current_session_id');
  if (!sessionId) return null;
  
  const sessions = getSessions();
  return sessions.find(s => s.id === sessionId) || null;
}

export function setCurrentSession(sessionId: string): void {
  sessionStorage.setItem('current_session_id', sessionId);
}
