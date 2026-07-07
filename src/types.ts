export type GermanText = {
  de: string;
  en?: string;
  phonetic?: string;
  ascii?: string;
};

export type VocabItem = GermanText & {
  id: string;
  ascii?: string;
  tags: string[];
  weak?: boolean;
  unlockStage?: number;
};

export type QuizQuestion = {
  id: string;
  type: "translate" | "fill" | "choice" | "spot" | "produce" | "sound";
  prompt: string;
  german?: GermanText[];
  choices?: string[];
  acceptable: string[];
  explanation: string;
  weakPoint?: string;
};

export type LessonSection = {
  title: string;
  body: string;
  examples: GermanText[];
};

export type Lesson = {
  id: string;
  eyebrow: string;
  title: string;
  lead: string;
  hero: GermanText;
  why: string;
  sections: LessonSection[];
  recap: string[];
  next: string;
};

export type ReviewRecord = {
  id: string;
  dueAt: string;
  intervalDays: number;
  updatedAt: string;
};

export type QuizRecord = {
  id: string;
  questionId: string;
  answer: string;
  correct: boolean;
  updatedAt: string;
};

export type WeakPointRecord = {
  id: string;
  label: string;
  misses: number;
  updatedAt: string;
};

export type UserProfile = {
  profileVersion: 1;
  deviceId: string;
  updatedAt: string;
  courseProgress: {
    currentLessonId: string;
    completedLessonIds: string[];
    streak: number;
    lastStudiedAt?: string;
  };
  quizHistory: QuizRecord[];
  weakPoints: WeakPointRecord[];
  reviewQueue: ReviewRecord[];
  settings: {
    googleClientId?: string;
    lastSyncedAt?: string;
    signedInHint?: string;
    reminderHour: number;
    ttsRate: number;
  };
};
