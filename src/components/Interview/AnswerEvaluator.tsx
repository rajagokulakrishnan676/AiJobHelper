import React from 'react';
import { Question, Answer } from '../../types';

export class AnswerEvaluator {
  // Code evaluation logic
  static evaluateCode(code: string, question: Question): { score: number; feedback: string; isCorrect: boolean; fixedCode?: string } {
    if (!code || code.trim().length === 0) {
      return {
        score: 0,
        feedback: "No code provided. Please write a solution to the problem.",
        isCorrect: false
      };
    }

    // Check for nonsense input
    if (this.isNonsenseInput(code)) {
      return {
        score: 0,
        feedback: "This is not valid code. Please write a proper function or solution.",
        isCorrect: false
      };
    }

    const language = question.language?.toLowerCase() || 'javascript';
    
    // Language-specific evaluation
    switch (language) {
      case 'javascript':
        return this.evaluateJavaScript(code, question);
      case 'python':
        return this.evaluatePython(code, question);
      case 'java':
        return this.evaluateJava(code, question);
      case 'sql':
        return this.evaluateSQL(code, question);
      default:
        return this.evaluateGenericCode(code, question);
    }
  }

  // Theoretical answer evaluation
  static evaluateTheoretical(answer: string, question: Question): { score: number; feedback: string; isCorrect: boolean; idealAnswer?: string } {
    if (!answer || answer.trim().length === 0) {
      return {
        score: 0,
        feedback: "No answer provided. Please explain the concept or provide your thoughts.",
        isCorrect: false
      };
    }

    if (this.isNonsenseInput(answer)) {
      return {
        score: 0,
        feedback: "I couldn't evaluate that. Could you provide a real answer explaining the concept?",
        isCorrect: false
      };
    }

    if (answer.trim().length < 10) {
      return {
        score: 2,
        feedback: "Your answer is too brief. Please provide more detailed explanation with examples if possible.",
        isCorrect: false
      };
    }

    // Evaluate based on question category
    return this.evaluateByCategory(answer, question);
  }

  // Behavioral answer evaluation
  static evaluateBehavioral(answer: string, question: Question): { score: number; feedback: string; isCorrect: boolean; starAnalysis?: string } {
    if (!answer || answer.trim().length === 0) {
      return {
        score: 0,
        feedback: "No answer provided. Please share a specific example from your experience.",
        isCorrect: false
      };
    }

    if (this.isNonsenseInput(answer)) {
      return {
        score: 0,
        feedback: "I couldn't evaluate that. Please provide a real example from your experience.",
        isCorrect: false
      };
    }

    return this.evaluateSTARMethod(answer, question);
  }

  // Check for nonsense input
  private static isNonsenseInput(input: string): boolean {
    const cleaned = input.replace(/\s+/g, '').toLowerCase();
    
    // Check for random characters
    if (/^[a-z]{3,}$/.test(cleaned) && !/\b(function|class|def|select|if|for|while|return|print|console)\b/.test(cleaned)) {
      return true;
    }

    // Check for repeated characters
    if (/(.)\1{4,}/.test(cleaned)) {
      return true;
    }

    // Check for keyboard mashing patterns
    const mashPatterns = ['asdf', 'qwer', 'zxcv', 'hjkl', '1234', 'abcd'];
    return mashPatterns.some(pattern => cleaned.includes(pattern));
  }

  // JavaScript code evaluation
  private static evaluateJavaScript(code: string, question: Question): { score: number; feedback: string; isCorrect: boolean; fixedCode?: string } {
    const issues: string[] = [];
    let score = 0;

    // Check for basic syntax
    if (!code.includes('function') && !code.includes('=>') && !code.includes('const') && !code.includes('let')) {
      issues.push("Missing function declaration");
    }

    // Check for common patterns based on question
    if (question.question.toLowerCase().includes('reverse')) {
      if (code.includes('.reverse()')) {
        issues.push("You used the built-in reverse() method, but the question asks to implement without built-in methods");
        score = 3;
      } else if (code.includes('for') || code.includes('while')) {
        score = 8;
      } else {
        issues.push("Consider using a loop to reverse the string");
        score = 4;
      }
    }

    if (question.question.toLowerCase().includes('second largest')) {
      if (code.includes('sort')) {
        score = 6;
        issues.push("Sorting works but is not the most efficient approach (O(n log n))");
      } else if (code.includes('Math.max')) {
        score = 7;
      } else {
        score = 5;
        issues.push("Consider tracking the largest and second largest values in a single pass");
      }
    }

    // Check for syntax errors
    try {
      new Function(code);
      score += 2; // Bonus for valid syntax
    } catch (error) {
      issues.push("Syntax error detected");
      score = Math.max(0, score - 2);
    }

    const feedback = issues.length > 0 
      ? `Issues found: ${issues.join(', ')}. ${this.getJavaScriptFix(question)}`
      : "Good solution! Your code demonstrates proper JavaScript syntax and logic.";

    return {
      score: Math.min(10, score),
      feedback,
      isCorrect: score >= 7,
      fixedCode: issues.length > 0 ? this.generateJavaScriptFix(question) : undefined
    };
  }

  // Python code evaluation
  private static evaluatePython(code: string, question: Question): { score: number; feedback: string; isCorrect: boolean; fixedCode?: string } {
    const issues: string[] = [];
    let score = 0;

    if (!code.includes('def ') && !code.includes('lambda')) {
      issues.push("Missing function definition");
    }

    if (!code.includes('return')) {
      issues.push("Missing return statement");
    }

    // Check indentation
    if (code.includes('def ') && !code.includes('    ')) {
      issues.push("Python requires proper indentation");
    }

    // Question-specific checks
    if (question.question.toLowerCase().includes('reverse')) {
      if (code.includes('[::-1]')) {
        issues.push("You used slicing, but try implementing without built-in methods");
        score = 6;
      } else if (code.includes('for') || code.includes('while')) {
        score = 8;
      }
    }

    score += issues.length === 0 ? 8 : Math.max(2, 6 - issues.length);

    return {
      score: Math.min(10, score),
      feedback: issues.length > 0 
        ? `Issues: ${issues.join(', ')}. ${this.getPythonFix(question)}`
        : "Excellent Python code! Good use of syntax and logic.",
      isCorrect: score >= 7,
      fixedCode: issues.length > 0 ? this.generatePythonFix(question) : undefined
    };
  }

  // SQL evaluation
  private static evaluateSQL(code: string, question: Question): { score: number; feedback: string; isCorrect: boolean; fixedCode?: string } {
    const issues: string[] = [];
    let score = 0;

    const sqlKeywords = ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN'];
    const hasBasicStructure = code.toUpperCase().includes('SELECT') && code.toUpperCase().includes('FROM');

    if (!hasBasicStructure) {
      issues.push("Missing basic SELECT...FROM structure");
      score = 1;
    } else {
      score = 5;
    }

    // Question-specific evaluation
    if (question.question.toLowerCase().includes('second highest')) {
      if (code.toUpperCase().includes('LIMIT') && code.toUpperCase().includes('OFFSET')) {
        score = 8;
      } else if (code.toUpperCase().includes('ROW_NUMBER()') || code.toUpperCase().includes('RANK()')) {
        score = 9;
      } else {
        issues.push("Consider using LIMIT with OFFSET or window functions for second highest");
        score = 4;
      }
    }

    if (question.question.toLowerCase().includes('join')) {
      if (!code.toUpperCase().includes('JOIN')) {
        issues.push("This question requires a JOIN operation");
        score = 2;
      } else {
        score = 8;
      }
    }

    return {
      score: Math.min(10, score),
      feedback: issues.length > 0 
        ? `SQL Issues: ${issues.join(', ')}. ${this.getSQLFix(question)}`
        : "Great SQL query! Proper syntax and logic.",
      isCorrect: score >= 7,
      fixedCode: issues.length > 0 ? this.generateSQLFix(question) : undefined
    };
  }

  // Evaluate by theoretical category
  private static evaluateByCategory(answer: string, question: Question): { score: number; feedback: string; isCorrect: boolean; idealAnswer?: string } {
    const answerLower = answer.toLowerCase();
    let score = 0;
    const feedback: string[] = [];

    // API Design questions
    if (question.question.toLowerCase().includes('rest') && question.question.toLowerCase().includes('graphql')) {
      const hasREST = answerLower.includes('rest') || answerLower.includes('representational');
      const hasGraphQL = answerLower.includes('graphql') || answerLower.includes('graph ql');
      const mentionsHTTP = answerLower.includes('http') || answerLower.includes('endpoint');
      const mentionsQuery = answerLower.includes('query') || answerLower.includes('single endpoint');

      if (hasREST && hasGraphQL) score += 4;
      if (mentionsHTTP) score += 2;
      if (mentionsQuery) score += 2;
      if (answerLower.includes('over-fetching') || answerLower.includes('under-fetching')) score += 2;

      if (score < 6) {
        feedback.push("Try explaining the key differences: REST uses multiple endpoints, GraphQL uses a single endpoint with flexible queries");
      }
    }

    // SOLID principles
    if (question.question.toLowerCase().includes('solid')) {
      const principles = ['single responsibility', 'open closed', 'liskov substitution', 'interface segregation', 'dependency inversion'];
      const mentionedPrinciples = principles.filter(p => answerLower.includes(p.replace(' ', '')));
      
      score = mentionedPrinciples.length * 2;
      
      if (score < 6) {
        feedback.push("SOLID includes: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion");
      }
    }

    // Microservices
    if (question.question.toLowerCase().includes('microservices')) {
      const concepts = ['independent', 'scalable', 'distributed', 'api', 'database', 'deployment'];
      const mentionedConcepts = concepts.filter(c => answerLower.includes(c));
      
      score = Math.min(8, mentionedConcepts.length * 1.5);
      
      if (score < 6) {
        feedback.push("Mention key aspects: independent services, separate databases, API communication, independent deployment");
      }
    }

    // Default scoring for other questions
    if (score === 0) {
      if (answer.length > 100) score = 6;
      else if (answer.length > 50) score = 4;
      else score = 2;
    }

    return {
      score: Math.min(10, score),
      feedback: feedback.length > 0 
        ? feedback.join('. ') 
        : score >= 7 
          ? "Good explanation! You covered the key concepts well."
          : "Your answer touches on some points, but could be more comprehensive.",
      isCorrect: score >= 7,
      idealAnswer: this.getIdealAnswer(question)
    };
  }

  // STAR method evaluation for behavioral questions
  private static evaluateSTARMethod(answer: string, question: Question): { score: number; feedback: string; isCorrect: boolean; starAnalysis?: string } {
    const answerLower = answer.toLowerCase();
    let score = 0;
    const starElements: string[] = [];

    // Check for STAR components
    const hasSituation = answerLower.includes('situation') || answerLower.includes('when') || answerLower.includes('time') || answerLower.includes('project');
    const hasTask = answerLower.includes('task') || answerLower.includes('responsible') || answerLower.includes('needed to') || answerLower.includes('had to');
    const hasAction = answerLower.includes('action') || answerLower.includes('did') || answerLower.includes('implemented') || answerLower.includes('decided');
    const hasResult = answerLower.includes('result') || answerLower.includes('outcome') || answerLower.includes('achieved') || answerLower.includes('improved');

    if (hasSituation) { score += 2; starElements.push('Situation'); }
    if (hasTask) { score += 2; starElements.push('Task'); }
    if (hasAction) { score += 3; starElements.push('Action'); }
    if (hasResult) { score += 3; starElements.push('Result'); }

    // Length and detail bonus
    if (answer.length > 200) score += 1;

    const missingElements = ['Situation', 'Task', 'Action', 'Result'].filter(e => !starElements.includes(e));
    
    let feedback = '';
    if (score >= 8) {
      feedback = "Excellent STAR format! You clearly described the situation, task, actions, and results.";
    } else if (score >= 6) {
      feedback = `Good structure! Consider adding more detail about: ${missingElements.join(', ')}.`;
    } else {
      feedback = `Try using the STAR method: Situation (context), Task (what needed to be done), Action (what you did), Result (outcome). Missing: ${missingElements.join(', ')}.`;
    }

    return {
      score: Math.min(10, score),
      feedback,
      isCorrect: score >= 7,
      starAnalysis: `STAR Elements Found: ${starElements.join(', ')}${missingElements.length > 0 ? `. Missing: ${missingElements.join(', ')}` : ''}`
    };
  }

  // Generate fixes for different languages
  private static generateJavaScriptFix(question: Question): string {
    if (question.question.toLowerCase().includes('reverse')) {
      return `// Correct solution for reversing a string
function reverseString(str) {
    let reversed = '';
    for (let i = str.length - 1; i >= 0; i--) {
        reversed += str[i];
    }
    return reversed;
}

console.log(reverseString("hello")); // "olleh"`;
    }

    if (question.question.toLowerCase().includes('second largest')) {
      return `// Correct solution for second largest number
function secondLargest(arr) {
    let largest = -Infinity;
    let secondLargest = -Infinity;
    
    for (let num of arr) {
        if (num > largest) {
            secondLargest = largest;
            largest = num;
        } else if (num > secondLargest && num < largest) {
            secondLargest = num;
        }
    }
    
    return secondLargest;
}

console.log(secondLargest([1, 5, 3, 9, 2])); // 5`;
    }

    return `// Fixed code with proper structure
function solution() {
    // Your implementation here
    return result;
}`;
  }

  private static generatePythonFix(question: Question): string {
    if (question.question.toLowerCase().includes('reverse')) {
      return `# Correct solution for reversing a string
def reverse_string(s):
    reversed_str = ""
    for i in range(len(s) - 1, -1, -1):
        reversed_str += s[i]
    return reversed_str

print(reverse_string("hello"))  # "olleh"`;
    }

    return `# Fixed Python code
def solution():
    # Your implementation here
    return result`;
  }

  private static generateSQLFix(question: Question): string {
    if (question.question.toLowerCase().includes('second highest')) {
      return `-- Correct solution for second highest salary
SELECT salary 
FROM Employee 
ORDER BY salary DESC 
LIMIT 1 OFFSET 1;

-- Alternative using window functions
SELECT DISTINCT salary
FROM (
    SELECT salary, 
           ROW_NUMBER() OVER (ORDER BY salary DESC) as rn
    FROM Employee
) ranked
WHERE rn = 2;`;
    }

    return `-- Fixed SQL query
SELECT column_name
FROM table_name
WHERE condition;`;
  }

  private static getJavaScriptFix(question: Question): string {
    return "Here's the corrected JavaScript approach with proper syntax and logic.";
  }

  private static getPythonFix(question: Question): string {
    return "Here's the corrected Python solution with proper indentation and structure.";
  }

  private static getSQLFix(question: Question): string {
    return "Here's the corrected SQL query with proper syntax and logic.";
  }

  private static getIdealAnswer(question: Question): string {
    // Return ideal answers for common theoretical questions
    if (question.question.toLowerCase().includes('rest') && question.question.toLowerCase().includes('graphql')) {
      return "REST uses multiple endpoints for different resources with standard HTTP methods, while GraphQL uses a single endpoint where clients specify exactly what data they need. GraphQL prevents over-fetching and under-fetching, offers strong typing, and provides better developer tools, but REST is simpler and has better caching.";
    }

    return "A comprehensive answer should cover the main concepts, provide examples, and explain the practical implications.";
  }

  private static evaluateGenericCode(code: string, question: Question): { score: number; feedback: string; isCorrect: boolean } {
    // Basic code structure evaluation
    let score = 0;
    const issues: string[] = [];

    if (code.length < 10) {
      issues.push("Code is too short");
      score = 1;
    } else if (code.length > 20) {
      score = 5;
    }

    // Check for basic programming constructs
    if (code.includes('if') || code.includes('for') || code.includes('while')) {
      score += 2;
    }

    return {
      score: Math.min(10, score),
      feedback: issues.length > 0 
        ? `Issues: ${issues.join(', ')}. Please provide a more complete solution.`
        : "Code structure looks reasonable.",
      isCorrect: score >= 6
    };
  }
}

export default AnswerEvaluator;