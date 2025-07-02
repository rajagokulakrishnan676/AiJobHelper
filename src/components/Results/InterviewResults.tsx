import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Download, RotateCcw, Star, TrendingUp, Award } from 'lucide-react';
import { useInterviewStore } from '../../store/useInterviewStore';

export default function InterviewResults() {
  const { currentSession, isDarkMode, setCurrentView } = useInterviewStore();

  if (!currentSession) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No interview results found
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Complete an interview to see your results here.
          </p>
        </div>
      </div>
    );
  }

  const totalQuestions = currentSession.questions.length;
  const answeredQuestions = currentSession.answers.length;
  const averageScore = currentSession.answers.reduce((sum, answer) => sum + answer.score, 0) / answeredQuestions;
  const totalTime = currentSession.answers.reduce((sum, answer) => sum + answer.timeSpent, 0);

  const skillBreakdown = {
    coding: currentSession.answers.filter(a => currentSession.questions.find(q => q.id === a.questionId)?.type === 'coding'),
    sql: currentSession.answers.filter(a => currentSession.questions.find(q => q.id === a.questionId)?.type === 'sql'),
    behavioral: currentSession.answers.filter(a => currentSession.questions.find(q => q.id === a.questionId)?.type === 'behavioral'),
    theoretical: currentSession.answers.filter(a => currentSession.questions.find(q => q.id === a.questionId)?.type === 'theoretical')
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-100';
    if (score >= 6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateReport = () => {
    // In real app, would generate PDF using jsPDF
    console.log('Generating PDF report...');
    alert('PDF report download would start here!');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
            averageScore >= 8 ? 'bg-green-100' : averageScore >= 6 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <Trophy className={`h-12 w-12 ${getScoreColor(averageScore)}`} />
          </div>
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Interview Complete! 🎉
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Here's how you performed in your mock interview
          </p>
        </motion.div>

        {/* Overall Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-8 rounded-2xl mb-8 text-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Overall Performance
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(averageScore)}`}>
                {averageScore.toFixed(1)}/10
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Average Score
              </p>
            </div>
            
            <div>
              <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {answeredQuestions}/{totalQuestions}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Questions Completed
              </p>
            </div>
            
            <div>
              <div className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {formatTime(totalTime)}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Time
              </p>
            </div>
          </div>
        </motion.div>

        {/* Skill Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-8 rounded-2xl mb-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Performance by Category
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(skillBreakdown).map(([skill, answers]) => {
              if (answers.length === 0) return null;
              
              const avgScore = answers.reduce((sum, a) => sum + a.score, 0) / answers.length;
              
              return (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${getScoreColor(avgScore)}`}>
                      {avgScore.toFixed(1)}
                    </div>
                    <h4 className={`font-semibold mb-2 capitalize ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {skill}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {answers.length} question{answers.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Detailed Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-8 rounded-2xl mb-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Question-by-Question Breakdown
          </h3>
          
          <div className="space-y-6">
            {currentSession.questions.map((question, index) => {
              const answer = currentSession.answers.find(a => a.questionId === question.id);
              if (!answer) return null;
              
              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`p-6 rounded-lg border ${
                    isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          Q{index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {question.type}
                        </span>
                      </div>
                      <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {question.question}
                      </h4>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(answer.score)}`}>
                        {answer.score}/10
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatTime(answer.timeSpent)}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <strong>Feedback:</strong> {answer.feedback}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateReport}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Report
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView('upload')}
            className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            New Interview
          </motion.button>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Achievements Unlocked! 🏆
          </h3>
          
          <div className="flex flex-wrap justify-center gap-4">
            {averageScore >= 8 && (
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
              }`}>
                <Award className="h-5 w-5" />
                <span className="font-medium">Excellence Award</span>
              </div>
            )}
            
            {answeredQuestions === totalQuestions && (
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}>
                <Star className="h-5 w-5" />
                <span className="font-medium">Completion Master</span>
              </div>
            )}
            
            {totalTime < 600 && (
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
              }`}>
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Speed Demon</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}