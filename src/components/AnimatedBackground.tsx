import { useEffect, useRef, useMemo } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { isLowEndDevice, throttle } from '../utils/performance';
import { useTheme } from '../context/ThemeContext';

interface AnimatedBackgroundProps {
  withParticles?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  withParticles = false 
}) => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isLowEnd = useMemo(() => isLowEndDevice(), []);
  const { theme } = useTheme();
  
  // Reduce particle count on low-end devices and mobile
  const particleCount = useMemo(() => {
    if (isLowEnd) return 5;
    return window.innerWidth < 768 ? 10 : 20;
  }, [isLowEnd]);

  useEffect(() => {
    // Skip parallax effect if user prefers reduced motion, on mobile, or low-end device
    if (prefersReducedMotion || window.innerWidth < 768 || isLowEnd) {
      return;
    }

    // Throttle scroll handler for better performance
    const handleScroll = throttle(() => {
      if (backgroundRef.current) {
        const scrollY = window.scrollY;
        const parallaxSpeed = 0.5;
        backgroundRef.current.style.transform = `translateY(${scrollY * parallaxSpeed}px)`;
      }
    }, 16); // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion, isLowEnd]);

  return (
    <>
      <div 
        ref={backgroundRef}
        className="fixed inset-0 -z-10 overflow-hidden will-change-transform bg-background"
      />
      
      {withParticles && !prefersReducedMotion && !isLowEnd && (
        <>
          {/* Geometric shapes layer */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Large floating geometric shapes */}
            <div
              className="absolute opacity-10"
              style={{
                width: '400px',
                height: '400px',
                left: '10%',
                top: '20%',
                background: theme === 'light' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                filter: 'blur(60px)',
                animation: 'float 20s ease-in-out infinite',
              }}
            />
            <div
              className="absolute opacity-10"
              style={{
                width: '300px',
                height: '300px',
                right: '15%',
                top: '40%',
                background: theme === 'light'
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                  : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%',
                filter: 'blur(60px)',
                animation: 'float 25s ease-in-out infinite reverse',
                animationDelay: '2s',
              }}
            />
            <div
              className="absolute opacity-10"
              style={{
                width: '350px',
                height: '350px',
                left: '60%',
                bottom: '10%',
                background: theme === 'light'
                  ? 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '30% 70% 53% 47% / 39% 50% 50% 61%',
                filter: 'blur(60px)',
                animation: 'float 30s ease-in-out infinite',
                animationDelay: '5s',
              }}
            />
          </div>

          {/* Particle effects layer */}
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {Array.from({ length: particleCount }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-20"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: `radial-gradient(circle, ${
                    theme === 'light' ?
                    ['#a78bfa', '#60a5fa', '#34d399', '#f472b6'][Math.floor(Math.random() * 4)] :
                    ['#60a5fa', '#a78bfa', '#818cf8', '#c084fc'][Math.floor(Math.random() * 4)]
                  } 0%, transparent 70%)`,
                  animation: `particle-float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          {/* Gradient mesh overlay */}
          <div 
            className="fixed inset-0 -z-10 pointer-events-none opacity-30"
            style={{
              background: theme === 'light'
                ? 'radial-gradient(at 20% 30%, rgba(102, 126, 234, 0.1) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(245, 87, 108, 0.1) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(118, 75, 162, 0.1) 0px, transparent 50%)'
                : 'radial-gradient(at 20% 30%, rgba(79, 172, 254, 0.15) 0px, transparent 50%), radial-gradient(at 80% 70%, rgba(168, 237, 234, 0.15) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(102, 126, 234, 0.15) 0px, transparent 50%)',
            }}
          />
        </>
      )}
      
      <style>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(5deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(-5deg);
          }
        }
        
        @keyframes particle-float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          25% {
            transform: translate(20px, -30px) scale(1.2);
            opacity: 0.4;
          }
          50% {
            transform: translate(-20px, -60px) scale(0.8);
            opacity: 0.3;
          }
          75% {
            transform: translate(30px, -40px) scale(1.1);
            opacity: 0.35;
          }
        }

        /* Respect user's motion preferences */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  );
};
