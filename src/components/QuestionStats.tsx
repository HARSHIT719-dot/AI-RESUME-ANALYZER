import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Target, TrendingUp } from 'lucide-react';
import { InterviewQuestion } from '../types';

interface QuestionStatsProps {
  questions: InterviewQuestion[];
}

export const QuestionStats: React.FC<QuestionStatsProps> = ({ questions }) => {
  const stats = React.useMemo(() => {
    const categoryCount = questions.reduce((acc, q) => {
      acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficultyCount = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: questions.length,
      byCategory: categoryCount,
      byDifficulty: difficultyCount,
    };
  }, [questions]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-xl p-4 hover-lift"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Total Questions</h3>
        </div>
        <p className="text-3xl font-bold text-foreground">{stats.total}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-4 hover-lift"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Target className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
        </div>
        <p className="text-3xl font-bold text-foreground">{Object.keys(stats.byCategory).length}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(stats.byCategory).map(([category, count]) => (
            <span
              key={category}
              className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
            >
              {category}: {count}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-4 hover-lift"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-green-500/10">
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Difficulty Mix</h3>
        </div>
        <div className="space-y-1 mt-2">
          {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
            <div key={difficulty} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">{difficulty}:</span>
              <span className="font-semibold text-foreground">{count}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
