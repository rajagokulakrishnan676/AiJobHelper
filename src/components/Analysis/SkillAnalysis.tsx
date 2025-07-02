import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Target, Play, Zap, Code, Database, MessageSquare, User } from 'lucide-react';
import { useInterviewStore } from '../../store/useInterviewStore';
import { SkillGap, Question } from '../../types';

export default function SkillAnalysis() {
  const { 
    jobDescription, 
    isDarkMode, 
    setSkillGaps, 
    setCurrentView,
    speak,
    isVoiceEnabled
  } = useInterviewStore();
  
  const [skillGaps, setLocalSkillGaps] = useState<SkillGap[]>([]);
  const [matchingScore, setMatchingScore] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (!jobDescription) return;

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      // Enhanced skill gap analysis based on job description only
      const gaps: SkillGap[] = [];
      const allRequiredSkills = [...jobDescription.requiredSkills, ...jobDescription.preferredSkills];
      
      allRequiredSkills.forEach(skill => {
        const requiredLevel = jobDescription.requiredSkills.includes(skill) ? 8 : 6;
        // Since we don't have resume, assume user has basic knowledge (level 5-7)
        const assumedLevel = Math.floor(Math.random() * 3) + 5; // 5-7 range
        const gap = Math.max(0, requiredLevel - assumedLevel);
        
        gaps.push({
          skill,
          resumeLevel: assumedLevel,
          requiredLevel,
          gap,
          status: gap === 0 ? 'match' : gap <= 2 ? 'partial' : 'missing'
        });
      });

      setLocalSkillGaps(gaps);
      setSkillGaps(gaps);

      // Enhanced matching score calculation
      const totalPossibleScore = gaps.length * 10;
      const actualScore = gaps.reduce((sum, gap) => sum + Math.min(gap.resumeLevel, gap.requiredLevel), 0);
      const calculatedScore = Math.round((actualScore / totalPossibleScore) * 100);
      setMatchingScore(calculatedScore);
      
      setIsAnalyzing(false);
      
      if (isVoiceEnabled) {
        speak(`Analysis complete! Based on the job requirements, I've identified key areas to focus on during the interview. Let's start with your personalized questions.`);
      }
    }, 2000);
  }, [jobDescription, setSkillGaps, speak, isVoiceEnabled]);

  const generateQuestions = (): Question[] => {
    if (!jobDescription || !skillGaps) return [];
    
    const questions: Question[] = [];
    let questionId = 1;

    // Coding Questions (10+) - Based on JD languages
    const codingLanguages = jobDescription.languages || ['JavaScript', 'Python'];
    codingLanguages.forEach((language, index) => {
      const codingQuestions = [
        {
          id: (questionId++).toString(),
          type: 'coding' as const,
          question: `Implement a function to reverse a string without using built-in reverse methods in ${language}`,
          difficulty: 'easy' as const,
          language: language.toLowerCase(),
          category: 'Data Structures',
          points: 10
        },
        {
          id: (questionId++).toString(),
          type: 'coding' as const,
          question: `Write a function to find the second largest number in an array using ${language}`,
          difficulty: 'medium' as const,
          language: language.toLowerCase(),
          category: 'Algorithms',
          points: 15
        },
        {
          id: (questionId++).toString(),
          type: 'coding' as const,
          question: `Implement a binary search algorithm in ${language}`,
          difficulty: 'medium' as const,
          language: language.toLowerCase(),
          category: 'Search Algorithms',
          points: 20
        }
      ];
      questions.push(...codingQuestions.slice(0, index === 0 ? 3 : 2));
    });

    // SQL Questions (5+)
    if (jobDescription.requiredSkills.some(skill => skill.toLowerCase().includes('sql'))) {
      const sqlQuestions = [
        {
          id: (questionId++).toString(),
          type: 'sql' as const,
          question: 'Write a query to find the second highest salary from an Employee table',
          difficulty: 'medium' as const,
          category: 'Database Queries',
          points: 15
        },
        {
          id: (questionId++).toString(),
          type: 'sql' as const,
          question: 'Create a query to find employees who earn more than their managers',
          difficulty: 'hard' as const,
          category: 'Complex Joins',
          points: 25
        },
        {
          id: (questionId++).toString(),
          type: 'sql' as const,
          question: 'Write a query to calculate running totals using window functions',
          difficulty: 'hard' as const,
          category: 'Window Functions',
          points: 25
        },
        {
          id: (questionId++).toString(),
          type: 'sql' as const,
          question: 'Design a query to find duplicate records in a table',
          difficulty: 'medium' as const,
          category: 'Data Analysis',
          points: 15
        },
        {
          id: (questionId++).toString(),
          type: 'sql' as const,
          question: 'Write a query to pivot data from rows to columns',
          difficulty: 'hard' as const,
          category: 'Data Transformation',
          points: 25
        }
      ];
      questions.push(...sqlQuestions);
    }

    // Theoretical Questions (10+) - Based on JD skills
    const theoreticalQuestions = [
      {
        id: (questionId++).toString(),
        type: 'theoretical' as const,
        question: 'Explain the difference between REST and GraphQL APIs',
        difficulty: 'medium' as const,
        category: 'API Design',
        points: 15
      },
      {
        id: (questionId++).toString(),
        type: 'theoretical' as const,
        question: 'What are the SOLID principles in object-oriented programming?',
        difficulty: 'medium' as const,
        category: 'OOP Concepts',
        points: 15
      },
      {
        id: (questionId++).toString(),
        type: 'theoretical' as const,
        question: 'Explain database normalization and its benefits',
        difficulty: 'medium' as const,
        category: 'Database Design',
        points: 15
      },
      {
        id: (questionId++).toString(),
        type: 'theoretical' as const,
        question: 'What is the difference between synchronous and asynchronous programming?',
        difficulty: 'easy' as const,
        category: 'Programming Concepts',
        points: 10
      },
      {
        id: (questionId++).toString(),
        type: 'theoretical' as const,
        question: 'Explain microservices architecture and its advantages',
        difficulty: 'hard' as const,
        category: 'System Design',
        points: 25
      },
      {
        id: (questionId++).toString(),
        type: 'theoretical' as const,
        question: 'What are design patterns and give examples of commonly used ones?',
        difficulty: 'medium' as const,
        category: 'Design Patterns',
        points: 15
      },
      {
        id: (questionId++).toString(),
        type: 'theoretical' as const,
        question: 'Explain the concept of Big O notation and time complexity',
        difficulty: 'medium' as const,
        category: 'Algorithm Analysis',
        points: 15
      },
      {
        id: (questionId++).toString(),
        type: 'theoretical' as const,
        question: 'What is containerization and how does Docker work?',
        difficulty: 'medium' as const,
        category: 'DevOps',
        points: 15
      },
      {
        id: (questionId++).toString(),
        type: 'theoretical' as const,
        question: 'Explain the CAP theorem in distributed systems',
        difficulty: 'hard' as const,
        category: 'Distributed Systems',
        points: 25
      },
      {
        id: (questionId++).toString(),
        type: 'theoretical' as const,
        question: 'What are the principles of clean code?',
        difficulty: 'easy' as const,
        category: 'Code Quality',
        points: 10
      }
    ];
    questions.push(...theoreticalQuestions);

    // Behavioral Questions (5+)
    const behavioralQuestions = [
      {
        id: (questionId++).toString(),
        type: 'behavioral' as const,
        question: 'Tell me about a time when you had to learn a new technology quickly for a project',
        difficulty: 'medium' as const,
        category: 'Learning Agility',
        points: 15
      },
      {
        id: (questionId++).toString(),
        type: 'behavioral' as const,
        question: 'Describe a situation where you had to work with a difficult team member',
        difficulty: 'medium' as const,
        category: 'Teamwork',
        points: 15
      },
      {
        id: (questionId++).toString(),
        type: 'behavioral' as const,
        question: 'Tell me about a time when you made a mistake in your code. How did you handle it?',
        difficulty: 'medium' as const,
        category: 'Problem Solving',
        points: 15
      },
      {
        id: (questionId++).toString(),
        type: 'behavioral' as const,
        question: 'Describe a project you\'re most proud of and your role in it',
        difficulty: 'easy' as const,
        category: 'Achievement',
        points: 10
      },
      {
        id: (questionId++).toString(),
        type: 'behavioral' as const,
        question: 'How do you handle tight deadlines and pressure?',
        difficulty: 'medium' as const,
        category: 'Stress Management',
        points: 15
      }
    ];
    questions.push(...behavioralQuestions);

    return questions;
  };

  const radarData = skillGaps.slice(0, 6).map(gap => ({
    skill: gap.skill,
    required: gap.requiredLevel,
    current: gap.resumeLevel
  }));

  if (!jobDescription) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full`}
          />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Loading analysis...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
            AI Job Analysis & Interview Plan
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Personalized analysis for <span className="font-semibold">{jobDescription.title}</span> at {jobDescription.company}
          </p>
        </motion.div>

        {/* Job Requirements Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-8 rounded-2xl mb-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Job Requirements Analysis
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  {jobDescription.requiredSkills.length}
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Required Skills
                </p>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {jobDescription.languages.length}
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Programming Languages
                </p>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  30+
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Interview Questions
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Skill Requirements Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}
          >
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Required Skills Overview
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                  <PolarAngleAxis 
                    dataKey="skill" 
                    tick={{ fontSize: 12, fill: isDarkMode ? '#D1D5DB' : '#374151' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 10]}
                    tick={{ fontSize: 10, fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                  />
                  <Radar
                    name="Required Level"
                    dataKey="required"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Expected Level"
                    dataKey="current"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Interview Plan Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}
          >
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your Personalized Interview Plan
            </h3>
            <div className="space-y-4">
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}>
                <Code className={`h-6 w-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Coding Questions (10+)
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {jobDescription.languages?.join(', ') || 'JavaScript, Python'} challenges
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
              }`}>
                <Database className={`h-6 w-6 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    SQL Queries (5+)
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Database design and complex queries
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'
              }`}>
                <MessageSquare className={`h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Technical Theory (10+)
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    System design, algorithms, best practices
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
              }`}>
                <User className={`h-6 w-6 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Behavioral (5+)
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    STAR method coaching included
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Skill Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl mb-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Skills Focus Areas
          </h3>
          <div className="grid gap-4">
            {skillGaps.map((gap, index) => (
              <motion.div
                key={gap.skill}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    gap.status === 'match' ? 'bg-green-100 text-green-600' :
                    gap.status === 'partial' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {gap.status === 'match' ? <TrendingUp className="h-5 w-5" /> :
                     gap.status === 'partial' ? <Minus className="h-5 w-5" /> :
                     <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {gap.skill}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Expected level: {gap.resumeLevel}/10 | Required: {gap.requiredLevel}/10
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  gap.status === 'match' ? 'bg-green-100 text-green-800' :
                  gap.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {gap.status === 'match' ? 'Ready' :
                   gap.status === 'partial' ? 'Practice' : 'Focus Area'}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Start Interview Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const questions = generateQuestions();
              useInterviewStore.getState().startInterview(questions);
              if (isVoiceEnabled) {
                speak("Perfect! Let's start your personalized mock interview. I'll guide you through each question with real-time feedback.");
              }
            }}
            disabled={isAnalyzing}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-6 w-6 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-6 w-6 mr-2" />
                Start 30+ Question Interview
              </>
            )}
          </motion.button>
          <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            🎯 Personalized questions • 🎙️ Voice interaction • 🔧 AI code fixing • ⭐ Real-time feedback
          </p>
        </motion.div>
      </div>
    </div>
  );
}