import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
    score: number;
    size?: number;
    label?: string;
    showMetallicEffect?: boolean;
    showAnimation?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
    score,
    size = 200,
    label = "ATS Score",
    showMetallicEffect = true,
    showAnimation = true
}) => {
    const strokeWidth = size * 0.1;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    // Determine color based on score
    const getColor = (score: number) => {
        if (score >= 90) return '#22c55e'; // Green-500
        if (score >= 70) return '#eab308'; // Yellow-500
        return '#ef4444'; // Red-500
    };

    const progressColor = getColor(score);

    return (
        <div className="relative flex flex-col items-center justify-center p-4">
            <motion.div
                className="relative"
                style={{ width: size, height: size }}
                initial={showAnimation ? { scale: 0.8, opacity: 0 } : {}}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Glow effect */}
                {showMetallicEffect && (
                    <motion.div
                        className="absolute inset-0 rounded-full blur-xl"
                        style={{
                            background: `radial-gradient(circle, ${progressColor}40 0%, transparent 70%)`,
                        }}
                        animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [0.95, 1.05, 0.95],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                )}

                {/* Background Circle */}
                <svg
                    className="w-full h-full transform -rotate-90"
                    width={size}
                    height={size}
                >
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={progressColor} stopOpacity="1" />
                            <stop offset="100%" stopColor={progressColor} stopOpacity="0.7" />
                        </linearGradient>
                    </defs>
                    
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-muted/20"
                    />

                    {/* Progress Circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="url(#progressGradient)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        initial={showAnimation ? { strokeDashoffset: circumference } : { strokeDashoffset: offset }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        strokeLinecap="round"
                        style={{
                            filter: `drop-shadow(0 0 8px ${progressColor}80)`,
                        }}
                    />
                </svg>

                {/* Inner Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        initial={showAnimation ? { opacity: 0, scale: 0.5 } : {}}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        className="text-4xl sm:text-6xl font-black tabular-nums tracking-tighter font-heading"
                        style={{
                            color: progressColor,
                            textShadow: showMetallicEffect 
                                ? `0 2px 4px rgba(0,0,0,0.3), 0 0 20px ${progressColor}40` 
                                : 'none',
                            filter: showMetallicEffect ? 'brightness(1.1)' : 'none',
                        }}
                    >
                        {score}
                    </motion.div>
                    <motion.div
                        initial={showAnimation ? { opacity: 0, y: 10 } : {}}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="text-sm sm:text-base font-medium text-muted-foreground mt-2 uppercase tracking-widest"
                    >
                        {label}
                    </motion.div>
                </div>
            </motion.div>

            {/* Decorative Metallic Ring if enabled */}
            {showMetallicEffect && (
                <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 60%)',
                        boxShadow: 'inset 0 0 20px rgba(255,255,255,0.05)'
                    }}
                />
            )}
        </div>
    );
};
