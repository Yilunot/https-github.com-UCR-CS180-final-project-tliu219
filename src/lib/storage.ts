/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Session, FormAnalysis, ArcherProfile } from '../types';

const SESSIONS_KEY = 'bullseye_sessions';
const ANALYSES_KEY = 'bullseye_analyses';
const PROFILE_KEY = 'bullseye_profile';

export const storage = {
  saveProfile: (profile: ArcherProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  getProfile: (): ArcherProfile | null => {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveSession: (session: Session) => {
    const sessions = storage.getSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex > -1) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  getSessions: (): Session[] => {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  deleteSession: (id: string) => {
    const sessions = storage.getSessions().filter(s => s.id !== id);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  },

  saveAnalysis: (analysis: FormAnalysis) => {
    const analyses = storage.getAnalyses();
    analyses.push(analysis);
    localStorage.setItem(ANALYSES_KEY, JSON.stringify(analyses));
  },

  getAnalyses: (): FormAnalysis[] => {
    const data = localStorage.getItem(ANALYSES_KEY);
    return data ? JSON.parse(data) : [];
  }
};
