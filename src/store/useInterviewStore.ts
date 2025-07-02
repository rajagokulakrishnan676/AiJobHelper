import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JobDescription, SkillGap, InterviewSession, Question, Answer, Badge, VoiceSettings, AccessibilitySettings, UserProgress } from '../types';

interface InterviewStore {
  // User data
  jobDescription: JobDescription | null;
  skillGaps: SkillGap[];
  userProgress: UserProgress;
  
  // Interview state
  currentSession: InterviewSession | null;
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  isInterviewActive: boolean;
  interviewPhase: 'setup' | 'coding' | 'sql' | 'theoretical' | 'behavioral' | 'complete';
  
  // UI state
  isDarkMode: boolean;
  currentView: 'upload' | 'analysis' | 'interview' | 'results' | 'settings';
  isLoading: boolean;
  error: string | null;
  
  // Voice and accessibility
  voiceSettings: VoiceSettings;
  accessibilitySettings: AccessibilitySettings;
  isVoiceEnabled: boolean;
  isSpeaking: boolean;
  
  // Actions
  setJobDescription: (jd: JobDescription) => void;
  setSkillGaps: (gaps: SkillGap[]) => void;
  startInterview: (questions: Question[]) => void;
  submitAnswer: (answer: Answer) => void;
  nextQuestion: () => void;
  endInterview: () => void;
  retryQuestion: () => void;
  explainAnswer: (questionId: string) => void;
  fixCode: (code: string, language: string) => Promise<string>;
  
  // UI actions
  toggleDarkMode: () => void;
  setCurrentView: (view: 'upload' | 'analysis' | 'interview' | 'results' | 'settings') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Voice actions
  toggleVoice: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  updateVoiceSettings: (settings: Partial<VoiceSettings>) => void;
  
  // Accessibility actions
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void;
  
  // Progress actions
  addXP: (amount: number) => void;
  unlockBadge: (badge: Badge) => void;
  updateSkillLevel: (skill: string, level: number) => void;
  
  // Reset functions
  resetInterview: () => void;
  resetAll: () => void;
}

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      // Initial state
      jobDescription: null,
      skillGaps: [],
      userProgress: {
        totalXP: 0,
        level: 1,
        completedInterviews: 0,
        skillLevels: {},
        achievements: []
      },
      currentSession: null,
      currentQuestion: null,
      currentQuestionIndex: 0,
      isInterviewActive: false,
      interviewPhase: 'setup',
      isDarkMode: false,
      currentView: 'upload',
      isLoading: false,
      error: null,
      voiceSettings: {
        isEnabled: true,
        language: 'en-US',
        rate: 1,
        pitch: 1,
        volume: 0.8
      },
      accessibilitySettings: {
        highContrast: false,
        largeText: false,
        screenReader: false,
        reducedMotion: false
      },
      isVoiceEnabled: true,
      isSpeaking: false,

      // Actions
      setJobDescription: (jobDescription) => {
        set({ jobDescription, error: null });
      },
      
      setSkillGaps: (skillGaps) => set({ skillGaps }),
      
      startInterview: (questions) => {
        try {
          const session: InterviewSession = {
            id: Date.now().toString(),
            userId: 'user',
            questions,
            answers: [],
            startTime: new Date(),
            overallScore: 0,
            skillScores: {},
            currentQuestionIndex: 0,
            totalQuestions: questions.length,
            badges: [],
            xpEarned: 0
          };
          
          set({
            currentSession: session,
            currentQuestion: questions[0] || null,
            currentQuestionIndex: 0,
            isInterviewActive: true,
            currentView: 'interview',
            interviewPhase: questions[0]?.type === 'coding' ? 'coding' : 
                           questions[0]?.type === 'sql' ? 'sql' :
                           questions[0]?.type === 'theoretical' ? 'theoretical' : 'behavioral',
            error: null
          });
        } catch (error) {
          set({ 
            error: 'Failed to start interview. Please try again.',
            currentView: 'analysis'
          });
        }
      },
      
      submitAnswer: (answer) => {
        try {
          const { currentSession } = get();
          if (!currentSession) return;
          
          const updatedAnswers = [...currentSession.answers, answer];
          const updatedSession = { ...currentSession, answers: updatedAnswers };
          
          // Calculate XP based on score
          const xpGained = Math.floor(answer.score * 10);
          get().addXP(xpGained);
          
          set({ currentSession: updatedSession, error: null });
        } catch (error) {
          set({ error: 'Failed to submit answer. Please try again.' });
        }
      },
      
      nextQuestion: () => {
        try {
          const { currentSession, currentQuestionIndex } = get();
          if (!currentSession) return;
          
          const nextIndex = currentQuestionIndex + 1;
          if (nextIndex < currentSession.questions.length) {
            const nextQuestion = currentSession.questions[nextIndex];
            set({
              currentQuestionIndex: nextIndex,
              currentQuestion: nextQuestion,
              interviewPhase: nextQuestion.type === 'coding' ? 'coding' : 
                             nextQuestion.type === 'sql' ? 'sql' :
                             nextQuestion.type === 'theoretical' ? 'theoretical' : 'behavioral',
              error: null
            });
          } else {
            get().endInterview();
          }
        } catch (error) {
          set({ error: 'Failed to load next question. Please try again.' });
        }
      },
      
      endInterview: () => {
        try {
          const { currentSession, userProgress } = get();
          if (!currentSession) return;
          
          const endTime = new Date();
          const totalScore = currentSession.answers.length > 0 
            ? currentSession.answers.reduce((sum, answer) => sum + answer.score, 0) / currentSession.answers.length
            : 0;
          
          const updatedSession = {
            ...currentSession,
            endTime,
            overallScore: totalScore
          };
          
          // Update user progress
          const updatedProgress = {
            ...userProgress,
            completedInterviews: userProgress.completedInterviews + 1
          };
          
          set({
            currentSession: updatedSession,
            isInterviewActive: false,
            currentView: 'results',
            interviewPhase: 'complete',
            userProgress: updatedProgress,
            error: null
          });
        } catch (error) {
          set({ 
            error: 'Failed to complete interview. Your progress has been saved.',
            currentView: 'results'
          });
        }
      },
      
      retryQuestion: () => {
        try {
          const { currentSession, currentQuestionIndex } = get();
          if (!currentSession) return;
          
          // Remove the last answer for this question if it exists
          const currentQuestionId = currentSession.questions[currentQuestionIndex]?.id;
          const updatedAnswers = currentSession.answers.filter(
            answer => answer.questionId !== currentQuestionId
          );
          
          set({
            currentSession: {
              ...currentSession,
              answers: updatedAnswers
            },
            error: null
          });
        } catch (error) {
          set({ error: 'Failed to retry question. Please continue with the next question.' });
        }
      },
      
      explainAnswer: (questionId) => {
        try {
          const { currentSession } = get();
          if (!currentSession) return;
          
          const answer = currentSession.answers.find(a => a.questionId === questionId);
          if (!answer) return;
          
          // Simulate AI explanation
          const explanation = `Here's a detailed explanation: ${answer.feedback}. Key concepts: The solution demonstrates proper problem-solving approach and coding best practices.`;
          
          const updatedAnswers = currentSession.answers.map(a => 
            a.questionId === questionId 
              ? { ...a, aiExplanation: explanation }
              : a
          );
          
          set({
            currentSession: {
              ...currentSession,
              answers: updatedAnswers
            },
            error: null
          });
        } catch (error) {
          set({ error: 'Failed to generate explanation. Please try again.' });
        }
      },
      
      fixCode: async (code, language) => {
        try {
          // Simulate AI code fixing with error handling
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              try {
                if (!code || code.trim().length === 0) {
                  reject(new Error('No code provided to fix'));
                  return;
                }
                
                const fixedCode = `// AI Fixed Code for ${language}\n${code}\n\n// Fixed issues:\n// - Added proper syntax\n// - Improved logic flow\n// - Added error handling`;
                resolve(fixedCode);
              } catch (error) {
                reject(new Error('Failed to fix code. Please try manual correction.'));
              }
            }, 1000);
          });
        } catch (error) {
          throw new Error('Code fixing service unavailable. Please try again later.');
        }
      },
      
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      setCurrentView: (currentView) => set({ currentView, error: null }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      toggleVoice: () => set((state) => ({ isVoiceEnabled: !state.isVoiceEnabled })),
      
      speak: (text) => {
        try {
          const { voiceSettings, isVoiceEnabled } = get();
          if (!isVoiceEnabled || !window.speechSynthesis) return;
          
          // Stop any current speech
          window.speechSynthesis.cancel();
          
          set({ isSpeaking: true });
          
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = voiceSettings.rate;
          utterance.pitch = voiceSettings.pitch;
          utterance.volume = voiceSettings.volume;
          utterance.lang = voiceSettings.language;
          
          utterance.onend = () => set({ isSpeaking: false });
          utterance.onerror = () => set({ isSpeaking: false });
          
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          set({ isSpeaking: false });
          console.warn('Voice synthesis failed:', error);
        }
      },
      
      stopSpeaking: () => {
        try {
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }
        } catch (error) {
          console.warn('Failed to stop speech:', error);
        } finally {
          set({ isSpeaking: false });
        }
      },
      
      updateVoiceSettings: (settings) => {
        set((state) => ({
          voiceSettings: { ...state.voiceSettings, ...settings }
        }));
      },
      
      updateAccessibilitySettings: (settings) => {
        set((state) => ({
          accessibilitySettings: { ...state.accessibilitySettings, ...settings }
        }));
      },
      
      addXP: (amount) => {
        set((state) => {
          const newTotalXP = state.userProgress.totalXP + amount;
          const newLevel = Math.floor(newTotalXP / 1000) + 1;
          
          return {
            userProgress: {
              ...state.userProgress,
              totalXP: newTotalXP,
              level: newLevel
            }
          };
        });
      },
      
      unlockBadge: (badge) => {
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            achievements: [...state.userProgress.achievements, { ...badge, earned: true, earnedAt: new Date() }]
          }
        }));
      },
      
      updateSkillLevel: (skill, level) => {
        set((state) => ({
          userProgress: {
            ...state.userProgress,
            skillLevels: {
              ...state.userProgress.skillLevels,
              [skill]: level
            }
          }
        }));
      },
      
      resetInterview: () => {
        set({
          currentSession: null,
          currentQuestion: null,
          currentQuestionIndex: 0,
          isInterviewActive: false,
          interviewPhase: 'setup',
          currentView: 'upload',
          error: null
        });
      },
      
      resetAll: () => {
        set({
          jobDescription: null,
          skillGaps: [],
          currentSession: null,
          currentQuestion: null,
          currentQuestionIndex: 0,
          isInterviewActive: false,
          interviewPhase: 'setup',
          currentView: 'upload',
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'interview-store',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        voiceSettings: state.voiceSettings,
        accessibilitySettings: state.accessibilitySettings,
        userProgress: state.userProgress
      })
    }
  )
);