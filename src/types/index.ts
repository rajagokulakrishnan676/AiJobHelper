export interface Skill {
  name: string;
  level: number;
  category: 'technical' | 'soft' | 'language';
}

export interface JobDescription {
  title: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  description: string;
  experience: string;
  languages: string[];
  tools: string[];
  softSkills: string[];
}

export interface SkillGap {
  skill: string;
  resumeLevel: number;
  requiredLevel: number;
  gap: number;
  status: 'match' | 'partial' | 'missing';
}

export interface Question {
  id: string;
  type: 'coding' | 'sql' | 'theoretical' | 'behavioral';
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language?: string;
  expectedAnswer?: string;
  hints?: string[];
  category: string;
  points: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  questions: Question[];
  answers: Answer[];
  startTime: Date;
  endTime?: Date;
  overallScore: number;
  skillScores: Record<string, number>;
  currentQuestionIndex: number;
  totalQuestions: number;
  badges: Badge[];
  xpEarned: number;
}

export interface Answer {
  questionId: string;
  userAnswer: string;
  code?: string;
  score: number;
  feedback: string;
  timeSpent: number;
  attempts: number;
  isCorrect?: boolean;
  aiExplanation?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: Date;
  xpValue: number;
}

export interface VoiceSettings {
  isEnabled: boolean;
  language: string;
  rate: number;
  pitch: number;
  volume: number;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
}

export interface UserProgress {
  totalXP: number;
  level: number;
  completedInterviews: number;
  skillLevels: Record<string, number>;
  achievements: Badge[];
}