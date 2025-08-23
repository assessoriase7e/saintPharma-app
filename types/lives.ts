export interface UserLives {
  currentLives: number;
  maxLives: number;
  lastRegeneration: Date;
  livesHistory: LivesHistoryEntry[];
}

export interface LivesHistoryEntry {
  id: string;
  type: 'lost' | 'gained' | 'regenerated';
  amount: number;
  reason: string;
  timestamp: Date;
  quizId?: number;
  courseId?: number;
}

export interface LivesConfig {
  maxLives: number;
  regenerationIntervalHours: number;
  livesPerRegeneration: number;
  lossPerQuizFailure: number;
}

export interface LivesContextType {
  userLives: UserLives;
  config: LivesConfig;
  loseLives: (amount: number, reason: string, quizId?: number, courseId?: number) => void;
  canAccessCourses: () => boolean;
  getTimeUntilNextRegeneration: () => number;
  regenerateLives: () => void;
  resetLives: () => void;
}

export const DEFAULT_LIVES_CONFIG: LivesConfig = {
  maxLives: 10,
  regenerationIntervalHours: 24,
  livesPerRegeneration: 10,
  lossPerQuizFailure: 1,
};