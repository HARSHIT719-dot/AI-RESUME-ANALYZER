import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Layout, Key, CheckCircle } from 'lucide-react';

interface ScoreBreakdownProps {
  scores: {
    formatting?: number;
    content?: number;
    keywords?: number;
    atsCompatibility?: number;
  };
  showAnimation?: boolean;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  scores,
  showAnimation = true,
}) => {
  const metrics = [
    {
      label: 'Formatting',
      score: scores.formatting || 0,
      icon: Layout,
      color: '#3b82f6', // blue
    },
    {
      label: 'Content',
      score: scores.content || 0,
      icon: FileText,
      color: '#8b5cf6', // purple
    },
    {
      label: 'Keywords',
      score: scores.keywords || 0,
      icon: Key,
      color: '#ec4899', // pink
    },
    {
      label: 'ATS Compatible',
      score: scores.atsCompatibility || 0,
      icon: CheckCircle,
      color: '#10b981', // green
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const percentage = metric.score;
        
        return (
          <motion.div
            key={metric.label}
            initial={showAnimation ? { opacity: 0, y: 20 } : {}}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl p-4 bg-card border border-border hover-lift transition-all duration-300"
          >
            {/* Background gradient */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: `linear-gradient(135deg, ${metric.color}40 0%, transparent 100%)`,
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <Icon
                  className="w-5 h-5"
                  style={{ color: metric.color }}
                />
                <span
                  className="text-2xl font-bold font-heading"
                  style={{ color: metric.color }}
                >
                  {percentage}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {metric.label}
                </p>

                {/* Progress bar */}
                <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: metric.color }}
                    initial={showAnimation ? { width: 0 } : { width: `${percentage}%` }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
