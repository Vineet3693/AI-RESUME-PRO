import { create } from 'zustand';

export type CareerLevel = 'junior' | 'mid' | 'senior' | 'director';

interface Version {
  id: string;
  version_number: number;
  health_score: number;
  ats_parse_score: number;
  created_at: string;
}

interface ResumeState {
  sessionId: string | null;
  careerLevel: CareerLevel | null;
  industry: string | null;
  privacyMode: boolean;
  atsParseScore: number | null;
  healthScore: number | null;
  versions: Version[];
  currentVersion: number;
  
  setSession: (sessionId: string, careerLevel: CareerLevel, industry: string) => void;
  setScores: (atsParseScore: number, healthScore: number) => void;
  setPrivacyMode: (enabled: boolean) => void;
  addVersion: (version: Version) => void;
  setCurrentVersion: (version: number) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeState>((set) => ({
  sessionId: null,
  careerLevel: null,
  industry: null,
  privacyMode: false,
  atsParseScore: null,
  healthScore: null,
  versions: [],
  currentVersion: 0,

  setSession: (sessionId, careerLevel, industry) =>
    set({ sessionId, careerLevel, industry }),

  setScores: (atsParseScore, healthScore) =>
    set({ atsParseScore, healthScore }),

  setPrivacyMode: (enabled) =>
    set({ privacyMode: enabled }),

  addVersion: (version) =>
    set((state) => ({
      versions: [...state.versions, version],
      currentVersion: version.version_number,
    })),

  setCurrentVersion: (version) =>
    set({ currentVersion: version }),

  reset: () =>
    set({
      sessionId: null,
      careerLevel: null,
      industry: null,
      privacyMode: false,
      atsParseScore: null,
      healthScore: null,
      versions: [],
      currentVersion: 0,
    }),
}));
