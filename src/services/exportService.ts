/**
 * Export Service
 * Handles exporting analysis results and interview questions to various formats
 */

import { AnalysisResult, InterviewQuestion } from '../types';
import toast from 'react-hot-toast';

export interface ExportOptions {
  format: 'pdf' | 'clipboard' | 'text';
  includeAnalysis: boolean;
  includeQuestions: boolean;
  includeMetadata: boolean;
}

export interface ExportData {
  analysisResult?: AnalysisResult;
  interviewQuestions?: InterviewQuestion[];
  resumeMetadata?: {
    fileName: string;
    uploadDate: string;
    analysisDate: string;
  };
}

/**
 * Format analysis results as readable text
 */
export const formatAnalysisAsText = (result: AnalysisResult): string => {
  let text = '=== RESUME ANALYSIS RESULTS ===\n\n';
  
  text += `Overall ATS Score: ${result.overallScore}/100\n`;
  text += `Status: ${result.isPerfect ? 'Perfect ✓' : 'Needs Improvement'}\n\n`;
  
  text += `SUMMARY:\n${result.summary}\n\n`;
  
  if (result.strengths.length > 0) {
    text += `STRENGTHS:\n`;
    result.strengths.forEach((strength, index) => {
      text += `${index + 1}. ${strength}\n`;
    });
    text += '\n';
  }
  
  if (result.suggestions.length > 0) {
    text += `SUGGESTIONS FOR IMPROVEMENT:\n`;
    result.suggestions.forEach((suggestion, index) => {
      text += `${index + 1}. ${suggestion}\n`;
    });
    text += '\n';
  }
  
  if (result.formattingFeedback.length > 0) {
    text += `FORMATTING RECOMMENDATIONS:\n`;
    result.formattingFeedback.forEach((feedback, index) => {
      text += `${index + 1}. ${feedback}\n`;
    });
    text += '\n';
  }
  
  if (result.unnecessaryItems.length > 0) {
    text += `ITEMS TO REMOVE:\n`;
    result.unnecessaryItems.forEach((item, index) => {
      text += `${index + 1}. ${item}\n`;
    });
    text += '\n';
  }
  
  if (result.keywordAnalysis) {
    text += `KEYWORD ANALYSIS:\n`;
    text += `Keyword Score: ${result.keywordAnalysis.score}/100\n`;
    
    if (result.keywordAnalysis.presentKeywords.length > 0) {
      text += `Present Keywords: ${result.keywordAnalysis.presentKeywords.join(', ')}\n`;
    }
    
    if (result.keywordAnalysis.missingKeywords.length > 0) {
      text += `Missing Keywords: ${result.keywordAnalysis.missingKeywords.join(', ')}\n`;
    }
    text += '\n';
  }
  
  return text;
};

/**
 * Format interview questions as readable text
 */
export const formatQuestionsAsText = (questions: InterviewQuestion[]): string => {
  let text = '=== INTERVIEW QUESTIONS ===\n\n';
  
  const categorized = questions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = [];
    }
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, InterviewQuestion[]>);
  
  Object.entries(categorized).forEach(([category, qs]) => {
    text += `${category.toUpperCase()} QUESTIONS:\n`;
    qs.forEach((q, index) => {
      text += `${index + 1}. ${q.question}\n`;
      text += `   Difficulty: ${q.difficulty}\n\n`;
    });
  });
  
  return text;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Export analysis results to clipboard
 */
export const exportAnalysisToClipboard = async (
  result: AnalysisResult
): Promise<void> => {
  const text = formatAnalysisAsText(result);
  const success = await copyToClipboard(text);
  
  if (success) {
    toast.success('Analysis copied to clipboard!');
  } else {
    toast.error('Failed to copy to clipboard');
  }
};

/**
 * Export interview questions to clipboard
 */
export const exportQuestionsToClipboard = async (
  questions: InterviewQuestion[]
): Promise<void> => {
  const text = formatQuestionsAsText(questions);
  const success = await copyToClipboard(text);
  
  if (success) {
    toast.success('Questions copied to clipboard!');
  } else {
    toast.error('Failed to copy to clipboard');
  }
};

/**
 * Download text as file
 */
export const downloadAsTextFile = (
  content: string,
  filename: string
): void => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  toast.success(`Downloaded ${filename}`);
};

/**
 * Export analysis results as text file
 */
export const exportAnalysisAsTextFile = (result: AnalysisResult): void => {
  const text = formatAnalysisAsText(result);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadAsTextFile(text, `resume-analysis-${timestamp}.txt`);
};

/**
 * Export interview questions as text file
 */
export const exportQuestionsAsTextFile = (questions: InterviewQuestion[]): void => {
  const text = formatQuestionsAsText(questions);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadAsTextFile(text, `interview-questions-${timestamp}.txt`);
};

/**
 * Generate HTML for PDF export (can be used with print or PDF libraries)
 */
export const generateExportHTML = (data: ExportData): string => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Resume Analysis Report</title>
      <style>
        body {
          font-family: 'Inter', 'Arial', sans-serif;
          line-height: 1.6;
          color: #1f2937;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        h1 {
          color: #111827;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 10px;
          margin-bottom: 30px;
        }
        h2 {
          color: #374151;
          margin-top: 30px;
          margin-bottom: 15px;
          border-left: 4px solid #3b82f6;
          padding-left: 15px;
        }
        .score {
          font-size: 48px;
          font-weight: bold;
          color: #3b82f6;
          text-align: center;
          margin: 20px 0;
        }
        .section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .strength {
          color: #059669;
          margin: 10px 0;
        }
        .suggestion {
          color: #d97706;
          margin: 10px 0;
        }
        .issue {
          color: #dc2626;
          margin: 10px 0;
        }
        ul {
          list-style-type: none;
          padding-left: 0;
        }
        li {
          padding: 8px 0;
          padding-left: 25px;
          position: relative;
        }
        li:before {
          content: "•";
          position: absolute;
          left: 0;
          font-weight: bold;
        }
        .metadata {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <h1>Resume Analysis Report</h1>
  `;
  
  if (data.analysisResult) {
    const result = data.analysisResult;
    html += `
      <div class="score">${result.overallScore}/100</div>
      <p style="text-align: center; font-size: 18px; color: #6b7280;">
        ${result.isPerfect ? '✓ Perfect Resume' : 'Needs Improvement'}
      </p>
      
      <div class="section">
        <h2>Summary</h2>
        <p>${result.summary}</p>
      </div>
    `;
    
    if (result.strengths.length > 0) {
      html += `
        <div class="section">
          <h2>Strengths</h2>
          <ul>
            ${result.strengths.map(s => `<li class="strength">${s}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    if (result.suggestions.length > 0) {
      html += `
        <div class="section">
          <h2>Suggestions for Improvement</h2>
          <ul>
            ${result.suggestions.map(s => `<li class="suggestion">${s}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    if (result.formattingFeedback.length > 0) {
      html += `
        <div class="section">
          <h2>Formatting Recommendations</h2>
          <ul>
            ${result.formattingFeedback.map(f => `<li>${f}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    if (result.unnecessaryItems.length > 0) {
      html += `
        <div class="section">
          <h2>Items to Remove</h2>
          <ul>
            ${result.unnecessaryItems.map(i => `<li class="issue">${i}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  }
  
  if (data.interviewQuestions && data.interviewQuestions.length > 0) {
    html += `
      <h1 style="margin-top: 60px;">Interview Questions</h1>
    `;
    
    const categorized = data.interviewQuestions.reduce((acc, q) => {
      if (!acc[q.category]) {
        acc[q.category] = [];
      }
      acc[q.category].push(q);
      return acc;
    }, {} as Record<string, InterviewQuestion[]>);
    
    Object.entries(categorized).forEach(([category, questions]) => {
      html += `
        <div class="section">
          <h2>${category.charAt(0).toUpperCase() + category.slice(1)} Questions</h2>
          <ul>
            ${questions.map(q => `
              <li>
                ${q.question}
                <br><small style="color: #6b7280;">Difficulty: ${q.difficulty}</small>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    });
  }
  
  if (data.resumeMetadata) {
    html += `
      <div class="metadata">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        ${data.resumeMetadata.fileName ? `<p>File: ${data.resumeMetadata.fileName}</p>` : ''}
      </div>
    `;
  }
  
  html += `
    </body>
    </html>
  `;
  
  return html;
};

/**
 * Export as PDF using browser print dialog
 */
export const exportAsPDF = (data: ExportData): void => {
  const html = generateExportHTML(data);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
      toast.success('Opening print dialog...');
    };
  } else {
    toast.error('Please allow popups to export as PDF');
  }
};
