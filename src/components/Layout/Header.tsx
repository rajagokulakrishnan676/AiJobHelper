import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Moon, Sun, Settings, Volume2, VolumeX, User, Trophy } from 'lucide-react';
import { useInterviewStore } from '../../store/useInterviewStore';

export default function Header() {
  const { 
    isDarkMode, 
    toggleDarkMode, 
    isVoiceEnabled, 
    toggleVoice, 
    userProgress,
    setCurrentView,
    currentView
  } = useInterviewStore();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/95 border-gray-700 backdrop-blur-md' 
          : 'bg-white/95 border-gray-200 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => setCurrentView('upload')}
          >
            <div className="relative">
              <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
                <Brain className="h-6 w-6 text-white" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AIJobHelperX
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Advanced AI Interview Coach
              </p>
            </div>
          </motion.div>

          {/* User Progress */}
          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Trophy className={`h-5 w-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <div className="text-sm">
                <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Level {userProgress.level}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {userProgress.totalXP} XP
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors ${
                  isVoiceEnabled
                    ? isDarkMode ? 'bg-green-700 text-green-300' : 'bg-green-100 text-green-700'
                    : isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}
                title={isVoiceEnabled ? 'Voice Enabled' : 'Voice Disabled'}
              >
                {isVoiceEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentView('settings')}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === 'settings'
                    ? isDarkMode ? 'bg-blue-700 text-blue-300' : 'bg-blue-100 text-blue-700'
                    : isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Settings className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}