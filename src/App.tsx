import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useInterviewStore } from './store/useInterviewStore';
import Header from './components/Layout/Header';
import FileUpload from './components/Upload/FileUpload';
import SkillAnalysis from './components/Analysis/SkillAnalysis';
import InterviewInterface from './components/Interview/InterviewInterface';
import InterviewResults from './components/Results/InterviewResults';
import ErrorBoundary from './components/Common/ErrorBoundary';

function App() {
  const { currentView, isDarkMode, error, clearError } = useInterviewStore();

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Clear any errors when view changes
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const renderCurrentView = () => {
    try {
      switch (currentView) {
        case 'upload':
          return <FileUpload />;
        case 'analysis':
          return <SkillAnalysis />;
        case 'interview':
          return <InterviewInterface />;
        case 'results':
          return <InterviewResults />;
        default:
          return <FileUpload />;
      }
    } catch (error) {
      console.error('Error rendering view:', error);
      return <FileUpload />;
    }
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className={`min-h-screen transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <Header />
          <main className="relative">
            {/* Global Error Display */}
            {error && (
              <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 p-4 rounded-lg shadow-lg max-w-md w-full mx-4 ${
                isDarkMode ? 'bg-red-900/90 text-red-200 border border-red-700' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{error}</span>
                  <button
                    onClick={clearError}
                    className={`ml-2 text-lg font-bold ${
                      isDarkMode ? 'text-red-300 hover:text-red-100' : 'text-red-600 hover:text-red-800'
                    }`}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            {renderCurrentView()}
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;