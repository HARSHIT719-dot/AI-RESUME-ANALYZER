import confetti from 'canvas-confetti';

/**
 * Trigger a confetti celebration animation
 */
export const celebrateWithConfetti = () => {
  const duration = 2000; // Shorter duration
  const animationEnd = Date.now() + duration;
  const defaults = {
    startVelocity: 20, // Less intense
    spread: 120,      // More focused
    ticks: 40,        // Shorter lifespan
    zIndex: 9999
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 20; // Fixed, smaller number

    // Fire confetti from two sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.6, 0.8) } // Slightly higher origin
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: randomInRange(0.6, 0.8) } // Slightly higher origin
    });
  }, 750); // Less frequent bursts
};

/**
 * Trigger a simple confetti burst
 */
export const simpleConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

/**
 * Trigger confetti from specific position
 */
export const confettiFromPosition = (x: number, y: number) => {
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x, y }
  });
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x, y }
  });
};
