import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, RotateCcw, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';
import { useInterviewStore } from '../../store/useInterviewStore';

interface CodeEditorProps {
  language: string;
  initialCode?: string;
  onCodeChange: (code: string) => void;
  onExecute: (code: string) => Promise<{ output: string; error?: string }>;
}

export default function CodeEditor({ language, initialCode = '', onCodeChange, onExecute }: CodeEditorProps) {
  const { isDarkMode } = useInterviewStore();
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const getLanguageExtension = () => {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return javascript();
      case 'python':
        return python();
      case 'sql':
        return sql();
      case 'java':
        return java();
      case 'cpp':
      case 'c++':
        return cpp();
      default:
        return javascript();
    }
  };

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    onCodeChange(value);
  }, [onCodeChange]);

  const handleExecute = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    setExecutionError(null);

    try {
      const result = await onExecute(code);
      setOutput(result.output);
      if (result.error) {
        setExecutionError(result.error);
      }
    } catch (error) {
      setExecutionError(error instanceof Error ? error.message : 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    setExecutionError(null);
    onCodeChange(initialCode);
  };

  const getCodeTemplate = () => {
    switch (language.toLowerCase()) {
      case 'javascript':
        return `// Write your JavaScript solution here
function solution() {
    // Your code here
    return "Hello World";
}

console.log(solution());`;
      case 'python':
        return `# Write your Python solution here
def solution():
    # Your code here
    return "Hello World"

print(solution())`;
      case 'java':
        return `// Write your Java solution here
public class Solution {
    public static void main(String[] args) {
        // Your code here
        System.out.println("Hello World");
    }
}`;
      case 'sql':
        return `-- Write your SQL query here
SELECT 'Hello World' as message;`;
      default:
        return '// Write your code here\n';
    }
  };

  const handleUseTemplate = () => {
    const template = getCodeTemplate();
    setCode(template);
    onCodeChange(template);
  };

  return (
    <div className={`rounded-2xl overflow-hidden ${
      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    } shadow-lg`}>
      {/* Editor Header */}
      <div className={`px-6 py-4 border-b ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
              isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
            }`}>
              {language.toUpperCase()}
            </div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Code Editor
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUseTemplate}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Template
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#059669' }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExecute}
              disabled={isExecuting || !code.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isExecuting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isExecuting ? 'Running...' : 'Run Code'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <CodeMirror
          value={code}
          height="400px"
          theme={isDarkMode ? oneDark : undefined}
          extensions={[getLanguageExtension()]}
          onChange={handleCodeChange}
          placeholder="Start typing your code..."
          className="text-sm"
        />
      </div>

      {/* Output Panel */}
      <div className={`border-t ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      }`}>
        <div className="px-6 py-3">
          <div className="flex items-center space-x-2 mb-3">
            <div className={`p-1 rounded ${
              executionError 
                ? 'bg-red-100 text-red-600' 
                : output 
                ? 'bg-green-100 text-green-600' 
                : isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
            }`}>
              {executionError ? (
                <AlertCircle className="h-4 w-4" />
              ) : output ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </div>
            <span className={`text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Output
            </span>
          </div>
          
          <div className={`p-4 rounded-lg font-mono text-sm min-h-[100px] max-h-[200px] overflow-y-auto ${
            isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-900'
          } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {executionError ? (
              <pre className="text-red-500 whitespace-pre-wrap">{executionError}</pre>
            ) : output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                Output will appear here when you run your code...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}