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
  CHAT = 'CHAT',
  LIVE = 'LIVE'
}