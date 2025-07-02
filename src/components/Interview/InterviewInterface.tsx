import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageSquare, Code, Database, User, Clock, ArrowRight, CheckCircle, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { useInterviewStore } from '../../store/useInterviewStore';
import { Answer } from '../../types';
import CodeEditor from './CodeEditor';
import { AnswerEvaluator } from './AnswerEvaluator';

export default function InterviewInterface() {
  const { 
    currentSession, 
    currentQuestion, 
    currentQuestionIndex, 
    isDarkMode, 
    submitAnswer, 
    nextQuestion,
    endInterview,
    retryQuestion,
    speak,
    isVoiceEnabled
  } = useInterviewStore();

  const [answer, setAnswer] = useState('');
  const [code, setCode] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    isCorrect: boolean;
    fixedCode?: string;
    idealAnswer?: string;
    starAnalysis?: string;
  } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (!currentQuestion) return;
    
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion]);

  useEffect(() => {
    // Reset states when question changes
    setAnswer('');
    setCode('');
    setTimeSpent(0);
    setHasSubmitted(false);
    setEvaluation(null);
    setShowExplanation(false);
  }, [currentQuestionIndex]);

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      if (isVoiceEnabled) {
        speak("Voice recording stopped. You can continue typing or submit your answer.");
      }
    } else {
      setIsRecording(true);
      if (isVoiceEnabled) {
        speak("Voice recording started. Speak your answer clearly.");
      }
      
      // Simulate voice-to-text (in real app, would use Web Speech API)
      setTimeout(() => {
        setIsRecording(false);
        setAnswer(prev => prev + " [Voice input simulated - please type your actual answer]");
      }, 3000);
    }
  };

  const executeCode = async (code: string) => {
    try {
      if (currentQuestion?.language === 'javascript') {
        // Simple JavaScript evaluation (unsafe in production)
        try {
          const result = eval(code);
          return { output: String(result) };
        } catch (error) {
          return { 
            output: 'Execution failed', 
            error: error instanceof Error ? error.message : 'Syntax error' 
          };
        }
      } else if (currentQuestion?.language === 'python') {
        return { output: 'Python execution simulated:\nResult: Function executed successfully' };
      } else if (currentQuestion?.language === 'sql') {
        return { output: 'SQL query executed:\nRows returned: 5\nExecution time: 0.02s' };
      } else {
        return { output: 'Code executed successfully' };
      }
    } catch (error) {
      return { 
        output: 'Execution failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    const userAnswer = currentQuestion.type === 'coding' ? code : answer;
    
    // Check for empty answers
    if (!userAnswer.trim()) {
      if (isVoiceEnabled) {
        speak("Please provide an answer before submitting.");
      }
      return;
    }

    setIsEvaluating(true);

    // Simulate evaluation delay for realism
    setTimeout(() => {
      let evaluationResult;

      // Evaluate based on question type using AnswerEvaluator
      switch (currentQuestion.type) {
        case 'coding':
          evaluationResult = AnswerEvaluator.evaluateCode(code, currentQuestion);
          break;
        case 'sql':
          evaluationResult = AnswerEvaluator.evaluateCode(code, currentQuestion);
          break;
        case 'theoretical':
          evaluationResult = AnswerEvaluator.evaluateTheoretical(answer, currentQuestion);
          break;
        case 'behavioral':
          evaluationResult = AnswerEvaluator.evaluateBehavioral(answer, currentQuestion);
          break;
        default:
          evaluationResult = {
            score: 5,
            feedback: "Answer received and evaluated.",
            isCorrect: true
          };
      }

      setEvaluation(evaluationResult);
      setIsEvaluating(false);

      const answerData: Answer = {
        questionId: currentQuestion.id,
        userAnswer,
        code: currentQuestion.type === 'coding' || currentQuestion.type === 'sql' ? code : undefined,
        score: evaluationResult.score,
        feedback: evaluationResult.feedback,
        timeSpent,
        attempts: 1,
        isCorrect: evaluationResult.isCorrect
      };

      submitAnswer(answerData);
      setHasSubmitted(true);

      // Voice feedback
      if (isVoiceEnabled) {
        const scoreText = `You scored ${evaluationResult.score} out of 10. ${evaluationResult.isCorrect ? 'Well done!' : 'Good attempt!'} ${evaluationResult.feedback}`;
        speak(scoreText);
      }
    }, 1500); // Realistic evaluation time
  };

  const handleRetryQuestion = () => {
    retryQuestion();
    setAnswer('');
    setCode('');
    setHasSubmitted(false);
    setEvaluation(null);
    setShowExplanation(false);
    
    if (isVoiceEnabled) {
      speak("Let's try this question again. Take your time to provide a better answer.");
    }
  };

  const handleNextQuestion = () => {
    if (currentSession && currentQuestionIndex >= currentSession.questions.length - 1) {
      endInterview();
      if (isVoiceEnabled) {
        speak("Congratulations! You've completed the interview. Let's review your results.");
      }
    } else {
      nextQuestion();
      if (isVoiceEnabled) {
        speak("Moving to the next question. Keep up the great work!");
      }
    }
  };

  const handleShowExplanation = () => {
    setShowExplanation(true);
    if (isVoiceEnabled && evaluation) {
      if (evaluation.idealAnswer) {
        speak(`Here's the ideal answer: ${evaluation.idealAnswer}`);
      } else if (evaluation.fixedCode) {
        speak("I've provided the corrected code solution. Review it to understand the proper approach.");
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionIcon = () => {
    switch (currentQuestion?.type) {
      case 'coding':
        return <Code className="h-6 w-6" />;
      case 'sql':
        return <Database className="h-6 w-6" />;
      case 'behavioral':
      case 'theoretical':
        return <User className="h-6 w-6" />;
      default:
        return <MessageSquare className="h-6 w-6" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 8) return 'bg-green-100 border-green-300';
    if (score >= 6) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  if (!currentSession || !currentQuestion) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No active interview session
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Please start an interview from the analysis page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl mb-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                {getQuestionIcon()}
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Question {currentQuestionIndex + 1} of {currentSession.questions.length}
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentQuestion.type.charAt(0).toUpperCase() + currentQuestion.type.slice(1)} • {currentQuestion.difficulty} • {currentQuestion.points} points
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-mono text-sm">{formatTime(timeSpent)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : ''}`}>
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / currentSession.questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Question Display */}
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-8 rounded-2xl mb-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}
        >
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentQuestion.question}
          </h2>

          {/* Answer Interface */}
          <AnimatePresence mode="wait">
            {(currentQuestion.type === 'coding' || currentQuestion.type === 'sql') ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6"
              >
                <CodeEditor
                  language={currentQuestion.language || 'javascript'}
                  onCodeChange={setCode}
                  onExecute={executeCode}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-6"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleVoiceToggle}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      isRecording
                        ? 'bg-red-600 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isRecording ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                    {isRecording ? 'Stop Recording' : 'Voice Answer'}
                  </motion.button>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    or type your answer below
                  </span>
                </div>

                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={
                    currentQuestion.type === 'behavioral' 
                      ? "Use the STAR method: Situation, Task, Action, Result. Provide a specific example from your experience..."
                      : "Type your answer here... Be specific and provide examples where relevant."
                  }
                  rows={8}
                  className={`w-full p-6 rounded-xl border-2 transition-colors resize-none ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-400'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Evaluation Results */}
          <AnimatePresence>
            {isEvaluating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 p-4 rounded-lg border ${
                  isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"
                  />
                  <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Evaluating your answer...
                  </span>
                </div>
              </motion.div>
            )}

            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-6 rounded-lg border-2 ${getScoreBg(evaluation.score)}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {evaluation.isCorrect ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    )}
                    <div>
                      <h3 className="font-bold text-lg">
                        Score: <span className={getScoreColor(evaluation.score)}>{evaluation.score}/10</span>
                      </h3>
                      <p className="text-sm text-gray-600">
                        {evaluation.isCorrect ? 'Correct!' : 'Needs improvement'}
                      </p>
                    </div>
                  </div>
                  
                  {!showExplanation && (evaluation.fixedCode || evaluation.idealAnswer) && (
                    <button
                      onClick={handleShowExplanation}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Show Solution
                    </button>
                  )}
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Feedback:</h4>
                  <p className="text-gray-700">{evaluation.feedback}</p>
                </div>

                {evaluation.starAnalysis && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">STAR Method Analysis:</h4>
                    <p className="text-gray-700">{evaluation.starAnalysis}</p>
                  </div>
                )}

                {showExplanation && evaluation.fixedCode && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Corrected Solution:</h4>
                    <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${
                      isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {evaluation.fixedCode}
                    </pre>
                  </div>
                )}

                {showExplanation && evaluation.idealAnswer && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Ideal Answer:</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {evaluation.idealAnswer}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!hasSubmitted && !isEvaluating && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitAnswer}
                  disabled={(!answer.trim() && !code.trim()) || isEvaluating}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  Submit Answer
                </motion.button>
              )}
              
              {hasSubmitted && evaluation && !evaluation.isCorrect && (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetryQuestion}
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Question
                </motion.button>
              )}
              
              {hasSubmitted && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Answer submitted!</span>
                </div>
              )}
            </div>

            {hasSubmitted && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextQuestion}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
              >
                {currentQuestionIndex >= currentSession.questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}