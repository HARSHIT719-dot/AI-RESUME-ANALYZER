import { AnalysisResult } from '../types';

export const downloadResults = (result: AnalysisResult, fileName: string = 'resume-analysis'): void => {
  // Format results as readable text
  const textContent = formatResultsAsText(result);

  // Create blob and download
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadResultsAsJSON = (result: AnalysisResult, fileName: string = 'resume-analysis'): void => {
  // Format results as JSON
  const jsonContent = JSON.stringify(result, null, 2);

  // Create blob and download
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatResultsAsText = (result: AnalysisResult): string => {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════');
  lines.push('           RESUME ANALYSIS RESULTS');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');

  // Overall Score
  lines.push(`Overall Score: ${result.overallScore}/100`);
  lines.push('');

  // Category Scores
  if (result.categories) {
    lines.push('Category Breakdown:');
    lines.push('───────────────────────────────────────────────────────');
    Object.entries(result.categories).forEach(([category, score]) => {
      const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      lines.push(`  ${capitalizedCategory.padEnd(20)} ${score}/100`);
    });
    lines.push('');
  }

  // Strengths
  lines.push('Strengths:');
  lines.push('───────────────────────────────────────────────────────');
  result.strengths.forEach((strength: string, index: number) => {
    lines.push(`  ${index + 1}. ${strength}`);
  });
  lines.push('');

  // Areas for Improvement
  // Note: suggestions is the new field, mapping it here for download
  const improvements = result.suggestions || [];
  if (improvements.length > 0) {
    lines.push('Areas for Improvement:');
    lines.push('───────────────────────────────────────────────────────');
    improvements.forEach((improvement: string, index: number) => {
      lines.push(`  ${index + 1}. ${improvement}`);
    });
    lines.push('');
  }

  // Keywords
  if (result.keywordAnalysis) {
    lines.push('Keyword Analysis:');
    lines.push('───────────────────────────────────────────────────────');
    lines.push(`Score: ${result.keywordAnalysis.score}/100`);
    lines.push(`Present: ${result.keywordAnalysis.presentKeywords.join(', ')}`);
    lines.push(`Missing: ${result.keywordAnalysis.missingKeywords.join(', ')}`);
  } else if ((result as any).keywords) {
    // Legacy fallback
    lines.push('Key Skills & Keywords:');
    lines.push('───────────────────────────────────────────────────────');
    lines.push(`  ${(result as any).keywords.join(', ')}`);
    lines.push('');
  }
  lines.push('');

  lines.push('═══════════════════════════════════════════════════════');
  lines.push(`Generated on: ${new Date().toLocaleString()}`);
  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
};
