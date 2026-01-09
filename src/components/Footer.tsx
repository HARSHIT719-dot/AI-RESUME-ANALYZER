import { Crown, Github, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer: React.FC = () => {

  return (
    <footer className="mt-auto w-full">
      <div
        className="backdrop-blur-md bg-white/80 border-t border-gray-200 shadow-sm dark:bg-gray-800/80 dark:border-gray-700"
        style={{
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        }}
      >
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="text-muted-foreground">Own by</span>
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1.1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                <Crown
                  className="w-4 h-4 sm:w-5 sm:h-5 text-primary"
                  style={{
                    filter: 'drop-shadow(0 0 8px hsl(var(--primary)/0.6))',
                  }}
                />
              </motion.div>
              <span className="text-muted-foreground"> Born to rule </span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:scale-110 transform touch-manipulation p-2"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-300 hover:scale-110 transform touch-manipulation p-2"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            <div className="text-xs sm:text-sm text-muted-foreground text-center">
              <span className="hover:text-primary transition-colors duration-300 cursor-pointer">
                Powered by Gemini AI
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
