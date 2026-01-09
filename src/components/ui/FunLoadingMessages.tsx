import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_MESSAGES = [
  "🤖 Teaching AI to read resumes...",
  "📝 Analyzing your career highlights...",
  "🎯 Finding the perfect suggestions...",
  "💡 Generating brilliant ideas...",
  "🚀 Launching resume analysis...",
  "🔍 Scanning for hidden talents...",
  "✨ Sprinkling some AI magic...",
  "🎨 Crafting personalized feedback...",
  "🧠 AI is thinking really hard...",
  "⚡ Processing at lightning speed...",
  "🎪 Performing resume acrobatics...",
  "🎭 Rehearsing your success story...",
  "🌟 Polishing your professional shine...",
  "🎯 Aiming for perfection...",
  "🔮 Predicting your bright future...",
];

const QUESTION_MESSAGES = [
  "🤔 Crafting thought-provoking questions...",
  "💭 Brainstorming interview scenarios...",
  "🎤 Preparing your interview spotlight...",
  "📚 Consulting the question library...",
  "🎓 Designing your success path...",
  "🌈 Creating your interview rainbow...",
  "🎯 Targeting key competencies...",
  "🔥 Heating up the question forge...",
  "🎪 Juggling technical and behavioral questions...",
  "🚀 Launching question generator...",
  "💡 Illuminating interview insights...",
  "🎨 Painting your interview canvas...",
  "⭐ Gathering star questions...",
  "🎭 Setting the interview stage...",
  "🌟 Shining light on your skills...",
];

interface FunLoadingMessagesProps {
  type?: 'analysis' | 'questions';
  className?: string;
}

export const FunLoadingMessages: React.FC<FunLoadingMessagesProps> = ({
  type = 'analysis',
  className = '',
}) => {
  const messages = type === 'questions' ? QUESTION_MESSAGES : LOADING_MESSAGES;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={`relative h-8 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <p className="text-lg font-medium text-gray-300 text-center">
            {messages[currentIndex]}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
