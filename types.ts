export interface HistoryItem {
  id: string;
  thumbnail: string;
  fileName: string;
  timestamp: number;
  score: number;
  result: 'Real' | 'Fake' | 'Uncertain';
}

export interface AnalysisResult {
  score: number;
  verdict: 'Real' | 'Fake' | 'Uncertain';
  details: string;
  anomalies: string[];
  searchVerification?: {
    verified: boolean;
    sources: { title: string; uri: string }[];
  };
  locationVerification?: {
    verified: boolean;
    matches: { title: string; uri: string }[];
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppMode {
  SCAN = 'SCAN',
  CHAT = 'CHAT'
}

export type PlanType = 'TRIAL' | 'STARTER' | 'INTERMEDIATE' | 'BUSINESS';

export interface UserProfile {
  email: string;
  type: 'Individual' | 'Business';
  plan: PlanType;
  creditsRemaining: number;
  isTrialUsed: boolean;
}

export const PLAN_FEATURES: Record<PlanType, { scans: number; features: string[] }> = {
  TRIAL: {
    scans: 5,
    features: ['SCAN_BASIC']
  },
  STARTER: {
    scans: 20,
    features: ['SCAN_BASIC', 'REPORT']
  },
  INTERMEDIATE: {
    scans: 50,
    features: ['SCAN_BASIC', 'REPORT', 'SEARCH', 'CHAT']
  },
  BUSINESS: {
    scans: -1,
    features: ['SCAN_BASIC', 'REPORT', 'SEARCH', 'MAPS', 'CHAT', 'API']
  }
};