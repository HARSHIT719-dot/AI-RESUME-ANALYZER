/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        // Base foreground/backgrounds
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Muted text/elements
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        // Cards/Panels
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // Primary action colors (e.g., primary buttons)
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },

        // Secondary action colors (e.g., secondary buttons)
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        
        // Accent colors (general UI highlights, often used for links/icons)
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        
        // Destructive/Error colors
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },

        // Specific custom colors for gradients as per spec
        'light-title-start': '#2563EB',
        'light-title-end': '#A855F7',
        'dark-title-start': '#60A5FA',
        'dark-title-end': '#A855F7',

        // Feature pill button gradients
        'pill-smart-start': '#6366F1',
        'pill-smart-end': '#8B5CF6',
        'pill-instant-start': '#0EA5E9',
        'pill-instant-end': '#22C55E',
        'pill-ai-start': '#EC4899',
        'pill-ai-end': '#F97316',

        // Upload card button colors
        'upload-btn-primary-light': '#FB923C',
        'upload-btn-primary-dark': '#F97316',
        'upload-btn-secondary-light': '#0EA5E9', // Using one of the pill colors as a base
        'upload-btn-secondary-dark': '#38BDF8',
      },
      fontFamily: {
        sans: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
        heading: ['Orbitron', 'Rajdhani', 'sans-serif'],
        body: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.1' }],
        'h1': ['3rem', { lineHeight: '1.2' }],
        'h2': ['2.25rem', { lineHeight: '1.3' }],
        'h3': ['1.875rem', { lineHeight: '1.4' }],
        'body': ['1rem', { lineHeight: '1.6' }],
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'metallic-shine': 'metallic-shine 3s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 60px rgba(59, 130, 246, 0.6)' 
          },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'metallic-shine': {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            filter: 'brightness(1) contrast(1)',
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            filter: 'brightness(1.2) contrast(1.1)',
          },
        },
      },
      backgroundImage: {
        'metallic-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        'metallic-chrome': 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 25%, #ffffff 50%, #e8e8e8 75%, #c0c0c0 100%)',
        'metallic-silver': 'linear-gradient(135deg, #8e9eab 0%, #c4cdd5 25%, #eef2f3 50%, #c4cdd5 75%, #8e9eab 100%)',
        'metallic-gold': 'linear-gradient(135deg, #f7971e 0%, #ffd200 50%, #f7971e 100%)',
      },
    },
  },
  plugins: [],
}