import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, AlertCircle, CheckCircle, Brain, Zap, Target, RefreshCw } from 'lucide-react';
import { useInterviewStore } from '../../store/useInterviewStore';
import { JobDescription } from '../../types';

export default function FileUpload() {
  const { 
    isDarkMode, 
    setJobDescription, 
    setCurrentView, 
    error, 
    setError,
    clearError,
    speak,
    isVoiceEnabled,
    resetAll
  } = useInterviewStore();
  
  const [uploadStatus, setUploadStatus] = useState<{
    jd: 'idle' | 'uploading' | 'success' | 'error';
  }>({ jd: 'idle' });

  const [jdText, setJdText] = useState('');
  const jdTimeoutRef = useRef<NodeJS.Timeout>();

  const parseJobDescription = (text: string): Promise<JobDescription> => {
    return new Promise((resolve, reject) => {
      try {
        if (!text || text.trim().length < 50) {
          reject(new Error('Job description too short (minimum 50 characters)'));
          return;
        }
        
        const extractedSkills = extractSkillsFromText(text);
        const extractedLanguages = extractLanguagesFromText(text);
        const extractedTools = extractToolsFromText(text);
        const extractedSoftSkills = extractSoftSkillsFromText(text);
        const extractedTitle = extractTitleFromText(text);
        const extractedCompany = extractCompanyFromText(text);
        
        if (extractedSkills.required.length === 0) {
          reject(new Error('No technical skills found. Please include programming languages and tools.'));
          return;
        }
        
        const jobData: JobDescription = {
          title: extractedTitle,
          company: extractedCompany,
          requiredSkills: extractedSkills.required,
          preferredSkills: extractedSkills.preferred,
          languages: extractedLanguages,
          tools: extractedTools,
          softSkills: extractedSoftSkills,
          description: text,
          experience: extractExperienceFromText(text)
        };
        
        resolve(jobData);
      } catch (error) {
        reject(new Error('Failed to analyze job description'));
      }
    });
  };

  const extractSkillsFromText = (text: string) => {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Git',
      'TypeScript', 'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL', 'Redis', 'Kubernetes',
      'GraphQL', 'REST API', 'Microservices', 'CI/CD', 'Jenkins', 'Linux', 'Agile',
      'HTML', 'CSS', 'Express.js', 'Spring Boot', 'Django', 'Flask', 'C++', 'C#',
      'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB'
    ];
    
    const textLower = text.toLowerCase();
    const found = commonSkills.filter(skill => 
      textLower.includes(skill.toLowerCase()) || 
      textLower.includes(skill.toLowerCase().replace(/[.\s]/g, ''))
    );
    
    const splitPoint = Math.max(3, Math.floor(found.length * 0.7));
    
    return {
      required: found.slice(0, splitPoint),
      preferred: found.slice(splitPoint)
    };
  };

  const extractLanguagesFromText = (text: string) => {
    const languages = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin'];
    const textLower = text.toLowerCase();
    return languages.filter(lang => textLower.includes(lang.toLowerCase()));
  };

  const extractToolsFromText = (text: string) => {
    const tools = ['Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins', 'MongoDB', 'PostgreSQL', 'Redis'];
    const textLower = text.toLowerCase();
    return tools.filter(tool => textLower.includes(tool.toLowerCase()));
  };

  const extractSoftSkillsFromText = (text: string) => {
    const softSkills = ['Communication', 'Teamwork', 'Leadership', 'Problem Solving', 'Time Management', 'Adaptability'];
    const textLower = text.toLowerCase();
    return softSkills.filter(skill => 
      textLower.includes(skill.toLowerCase()) || 
      textLower.includes('team') || 
      textLower.includes('collaborate') || 
      textLower.includes('communicate')
    );
  };

  const extractTitleFromText = (text: string) => {
    const titlePatterns = [
      /(?:position|role|job title|title):\s*([^\n\r]+)/i,
      /^([^\n\r]*(?:developer|engineer|analyst|manager|lead|senior|junior)[^\n\r]*)/im,
      /hiring\s+(?:for\s+)?([^\n\r]+)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return "Software Developer";
  };

  const extractCompanyFromText = (text: string) => {
    const companyPatterns = [
      /(?:company|organization|employer):\s*([^\n\r]+)/i,
      /(?:at|@)\s+([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd|Company))/,
      /([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Ltd|Company))/
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return "TechCorp Inc.";
  };

  const extractExperienceFromText = (text: string) => {
    const expPatterns = [
      /(\d+)[\s-]*(?:to[\s-]*(\d+))?\s*years?\s*(?:of\s*)?experience/i,
      /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
      /experience:\s*(\d+[\s-]*(?:to[\s-]*\d+)?\s*years?)/i
    ];
    
    for (const pattern of expPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[0];
      }
    }
    
    return "2-5 years";
  };

  const handleJDInput = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    setJdText(text);
    
    // Clear previous timeout
    if (jdTimeoutRef.current) {
      clearTimeout(jdTimeoutRef.current);
    }
    
    if (text.length < 50) {
      setUploadStatus(prev => ({ ...prev, jd: 'idle' }));
      return;
    }

    setUploadStatus(prev => ({ ...prev, jd: 'uploading' }));
    clearError();

    // Debounce the analysis
    jdTimeoutRef.current = setTimeout(async () => {
      try {
        const jdData = await parseJobDescription(text);
        setJobDescription(jdData);
        setUploadStatus(prev => ({ ...prev, jd: 'success' }));
        
        if (isVoiceEnabled) {
          speak(`Excellent! I've analyzed the ${jdData.title} position. Your interview will focus on ${jdData.requiredSkills.slice(0, 3).join(', ')}.`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
        setError(errorMessage);
        setUploadStatus(prev => ({ ...prev, jd: 'error' }));
        
        if (isVoiceEnabled) {
          speak("Please provide more technical details in the job description.");
        }
      }
    }, 1000);
  }, [setJobDescription, setError, clearError, speak, isVoiceEnabled]);

  const handleRetryJD = () => {
    setUploadStatus(prev => ({ ...prev, jd: 'idle' }));
    setJdText('');
    clearError();
    if (jdTimeoutRef.current) {
      clearTimeout(jdTimeoutRef.current);
    }
  };

  const handleStartOver = () => {
    resetAll();
    setUploadStatus({ jd: 'idle' });
    setJdText('');
    clearError();
    if (jdTimeoutRef.current) {
      clearTimeout(jdTimeoutRef.current);
    }
    
    if (isVoiceEnabled) {
      speak("Starting fresh! Please paste the job description to begin your interview preparation.");
    }
  };

  const canProceed = uploadStatus.jd === 'success';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            className="flex justify-center mb-6"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
              <Brain className="h-12 w-12 text-white" />
            </div>
          </motion.div>
          
          <h1 className={`text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
            Welcome to AIJobHelperX
          </h1>
          <p className={`text-xl mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Your Advanced AI Interview Coach - Practice with 30+ Smart Questions
          </p>
          
          <div className="flex justify-center space-x-8 mb-8">
            <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              <Zap className="h-5 w-5" />
              <span className="font-medium">Real-time Feedback</span>
            </div>
            <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              <Target className="h-5 w-5" />
              <span className="font-medium">Personalized Questions</span>
            </div>
            <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              <Brain className="h-5 w-5" />
              <span className="font-medium">AI Code Fixing</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartOver}
            className={`mb-8 inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Start Over
          </motion.button>
        </motion.div>

        {/* Job Description Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-8 rounded-2xl border-2 transition-all duration-300 mb-8 ${
            uploadStatus.jd === 'success'
              ? isDarkMode ? 'border-green-400 bg-green-900/20' : 'border-green-400 bg-green-50'
              : uploadStatus.jd === 'error'
              ? isDarkMode ? 'border-red-400 bg-red-900/20' : 'border-red-400 bg-red-50'
              : isDarkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-white'
          }`}
        >
          <div className="text-center mb-6">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              uploadStatus.jd === 'success'
                ? 'bg-green-100 text-green-600'
                : uploadStatus.jd === 'error'
                ? 'bg-red-100 text-red-600'
                : uploadStatus.jd === 'uploading'
                ? isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'
                : isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'
            }`}>
              {uploadStatus.jd === 'success' ? (
                <CheckCircle className="h-10 w-10" />
              ) : uploadStatus.jd === 'error' ? (
                <AlertCircle className="h-10 w-10" />
              ) : uploadStatus.jd === 'uploading' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-10 w-10 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                <Briefcase className="h-10 w-10" />
              )}
            </div>
            
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Paste Job Description
            </h2>
            <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {uploadStatus.jd === 'success' 
                ? '✅ Job description analyzed! Ready to start your interview.'
                : uploadStatus.jd === 'uploading'
                ? '🔍 Analyzing job requirements...'
                : 'Paste the complete job description to get personalized interview questions'
              }
            </p>
          </div>

          <textarea
            value={jdText}
            onChange={handleJDInput}
            placeholder="Paste the complete job description here...

Include:
• Job title and company
• Required programming languages (e.g., Python, JavaScript, Java)
• Technical skills and frameworks
• Experience level
• Responsibilities and requirements

The more details you provide, the better your personalized interview will be!"
            rows={12}
            className={`w-full p-6 rounded-xl border-2 resize-none transition-colors text-lg ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400' 
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-purple-400'
            } focus:outline-none focus:ring-2 focus:ring-purple-200`}
          />

          {uploadStatus.jd === 'error' && (
            <div className="mt-6 text-center">
              <button
                onClick={handleRetryJD}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode ? 'text-purple-400 hover:text-purple-300 bg-purple-900/20 hover:bg-purple-900/30' : 'text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100'
                }`}
              >
                Clear and Try Again
              </button>
            </div>
          )}
        </motion.div>

        {/* Proceed Button */}
        <AnimatePresence>
          {canProceed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentView('analysis');
                  if (isVoiceEnabled) {
                    speak("Perfect! Let's analyze the job requirements and create a personalized interview plan with 30+ questions tailored to this position.");
                  }
                }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                <Brain className="h-6 w-6 mr-3" />
                Start AI Analysis & Interview Prep
              </motion.button>
              <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                🎯 Get ready for 30+ personalized questions based on the job requirements
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`mt-12 p-6 rounded-xl ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50'
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            💡 Tips for Best Results
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                What to Include:
              </h4>
              <ul className={`space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Specific programming languages (Python, Java, etc.)</li>
                <li>• Required frameworks and tools</li>
                <li>• Experience level and years required</li>
                <li>• Key responsibilities and duties</li>
              </ul>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Interview Features:
              </h4>
              <ul className={`space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• 30+ questions across coding, SQL, theory & behavioral</li>
                <li>• Real-time code execution and AI feedback</li>
                <li>• Voice interaction and explanations</li>
                <li>• Personalized improvement suggestions</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}