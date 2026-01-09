# AI Resume Analyzer - Project Structure Documentation

This document provides a detailed explanation of the project structure, file organization, and the purpose of each component.

## Table of Contents
- [Overview](#overview)
- [Frontend Structure](#frontend-structure)
- [Backend Structure](#backend-structure)
- [Configuration Files](#configuration-files)
- [Development Workflow](#development-workflow)

---

## Overview

The AI Resume Analyzer is a full-stack application with:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Python Flask + Google Gemini AI
- **Architecture**: Client-Server with RESTful API

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   React App     │ ──HTTP─→│   Flask API     │ ──API──→│  Gemini AI      │
│  (Frontend)     │ ←─JSON──│   (Backend)     │ ←─JSON──│  (Google)       │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## Frontend Structure

### 📁 `src/` - Source Code Root

#### 📁 `src/components/` - React Components

All UI components organized by functionality:

##### Main Components:
- **`AnalysisResults.tsx`** - Displays AI analysis results with suggestions and unnecessary items
  - Shows loading states with fun messages
  - Handles perfect resume case
  - Category filtering (All, Suggestions, Unnecessary Items)
  - Generate interview questions button

- **`InterviewQuestions.tsx`** - Displays generated interview questions
  - Category filtering (Technical, Behavioral, Experience)
  - Search functionality
  - Question grouping by category
  - Error handling with retry

- **`PDFPreview.tsx`** - PDF viewer with controls
  - Page navigation
  - Zoom in/out
  - Fit to width
  - Canvas rendering with proper cleanup

- **`SplitLayout.tsx`** - Two-column layout for PDF preview and results
  - Responsive design
  - Collapsible panels
  - Mobile-friendly

- **`UploadZone.tsx`** - Drag-and-drop file upload
  - File validation (PDF only, max 10MB)
  - Visual feedback for drag states
  - Error handling with toast notifications

- **`UploadContainer.tsx`** - Upload flow wrapper
  - Manages upload state
  - Handles file selection
  - Triggers analysis

##### UI Components (`src/components/ui/`):
- **`AnimatedSection.tsx`** - Wrapper for animated content
  - Multiple animation types (fadeInUp, slideIn, scaleIn)
  - Stagger support for lists
  - Respects reduced motion preferences

- **`Button.tsx`** - Custom button with animations
  - Multiple variants (primary, secondary, outline)
  - Loading state
  - Hover/tap animations
  - Accessibility support

- **`FunLoadingMessages.tsx`** - Rotating loading messages
  - 15 messages for analysis
  - 15 messages for questions
  - Smooth transitions every 2.5 seconds
  - Fun emojis

- **`GlassCard.tsx`** - Glassmorphism card component
  - Backdrop blur effect
  - Hover animations
  - Customizable padding

- **`LoadingSkeleton.tsx`** - Loading placeholder
  - Multiple variants (card, score, list)
  - Shimmer animation
  - Responsive sizing

- **`LoadingSpinner.tsx`** - Animated spinner
  - Multiple sizes (sm, md, lg, xl)
  - Rotating ring with gradient
  - Pulsing center dots

##### Other Components:
- **`AnimatedBackground.tsx`** - Animated gradient background
- **`ErrorBoundary.tsx`** - Error handling wrapper
- **`Footer.tsx`** - Application footer
- **`Header.tsx`** - Application header with branding
- **`OfflineIndicator.tsx`** - Network status indicator
- **`QuestionCard.tsx`** - Individual interview question card

#### 📁 `src/hooks/` - Custom React Hooks

Reusable logic extracted into hooks:

- **`useAnalysis.ts`** - Resume analysis state management
  - Handles API calls for analysis
  - Manages loading/error states
  - Triggers question generation

- **`useFileUpload.ts`** - File upload handling
  - PDF validation
  - Text extraction
  - Upload progress

- **`useNetworkStatus.ts`** - Network connectivity monitoring
  - Online/offline detection
  - Reconnection handling

- **`useReducedMotion.ts`** - Accessibility hook
  - Detects user's motion preferences
  - Disables animations if needed

- **`useAnimationFallback.ts`** - Animation fallback
  - Provides static alternatives
  - Performance optimization

#### 📁 `src/services/` - API & Services

External service integrations:

- **`apiClient.ts`** - Backend API client
  - `analyzeResume()` - Send resume for AI analysis
  - `generateQuestions()` - Generate interview questions
  - `checkHealth()` - Backend health check
  - Error handling with custom error classes
  - Timeout support (30 seconds)
  - User-friendly error messages

#### 📁 `src/styles/` - Global Styles

- **`globals.css`** - Tailwind CSS + custom styles
  - Dark theme colors
  - Custom animations
  - Glassmorphism utilities
  - Responsive typography
  - Accessibility styles

#### 📁 `src/types/` - TypeScript Definitions

- **`index.ts`** - Type definitions
  ```typescript
  interface AnalysisResult {
    isPerfect: boolean;
    suggestions: string[];
    unnecessaryItems: string[];
    summary: string;
  }
  
  interface InterviewQuestion {
    id?: string;
    question: string;
    category: 'technical' | 'behavioral' | 'experience';
    difficulty: 'easy' | 'medium' | 'hard';
  }
  ```

#### 📁 `src/utils/` - Utility Functions

Helper functions and configurations:

- **`animations.ts`** - Framer Motion animation configs
  - Predefined animations (fadeInUp, slideIn, etc.)
  - Easing functions
  - Duration constants

- **`confetti.ts`** - Confetti celebration effects
  - Triggered on successful analysis
  - Customizable colors and patterns

- **`downloadResults.ts`** - Download functionality
  - Export analysis as text/PDF
  - Format results for download

- **`performance.ts`** - Performance utilities
  - Lazy loading helpers
  - Debounce/throttle functions

#### 📁 `src/test/` - Test Configuration

- **`setup.ts`** - Vitest test setup
  - Testing library configuration
  - Global test utilities
  - Mock setup

#### Root Files:
- **`App.tsx`** - Main application component
  - Route management
  - Global state
  - Layout structure

- **`main.tsx`** - React entry point
  - React DOM rendering
  - Provider setup
  - Global error handling

---

## Backend Structure

### 📁 `backend/` - Python Flask Backend

#### 📁 `backend/services/` - Backend Services

- **`ai_service.py`** - Google Gemini AI Integration
  ```python
  class AIService:
      def analyze_resume(resume_text: str) -> Tuple[Dict, str]
      def generate_questions(resume_text: str, analysis: Dict) -> Tuple[Dict, str]
  ```
  - Initializes Gemini AI model (gemini-2.5-flash)
  - Analyzes resume content
  - Generates interview questions
  - Error handling and logging

- **`pdf_service.py`** - PDF Processing
  ```python
  class PDFService:
      def extract_text_from_pdf(pdf_file) -> Tuple[str, str]
  ```
  - Extracts text from PDF files
  - Handles various PDF formats
  - Error handling for corrupted files

#### 📁 `backend/tests/` - Backend Tests

- **`conftest.py`** - Pytest configuration and fixtures
- **`test_ai_service.py`** - AI service unit tests
- **`test_api_endpoints.py`** - API endpoint integration tests
- **`test_pdf_service.py`** - PDF service unit tests

#### Root Files:

- **`app.py`** - Flask Application
  - API endpoints:
    - `POST /api/analyze` - Analyze resume
    - `POST /api/generate-questions` - Generate questions
    - `GET /api/health` - Health check
  - CORS configuration
  - Error handlers
  - Request logging

- **`requirements.txt`** - Python Dependencies
  ```
  Flask==2.3.2
  Flask-Cors==4.0.0
  google-generativeai==0.8.5
  python-dotenv==1.1.0
  PyPDF2==3.0.1
  pytest==7.4.0
  ```

- **`.env.example`** - Environment template
- **`pytest.ini`** - Pytest configuration
- **`README.md`** - Backend documentation

---

## Configuration Files

### Frontend Configuration

- **`package.json`** - Frontend dependencies and scripts
  ```json
  {
    "scripts": {
      "dev": "vite",
      "build": "tsc && vite build",
      "test": "vitest --run",
      "preview": "vite preview"
    }
  }
  ```

- **`vite.config.ts`** - Vite build configuration
  - React plugin
  - Code splitting
  - Vitest configuration
  - Build optimizations

- **`tailwind.config.js`** - Tailwind CSS configuration
  - Custom colors (dark theme)
  - Custom fonts
  - Custom animations
  - Responsive breakpoints

- **`tsconfig.json`** - TypeScript configuration
  - Strict mode enabled
  - Path aliases
  - JSX configuration

- **`.eslintrc.cjs`** - ESLint rules
  - React hooks rules
  - TypeScript rules
  - Code quality rules

- **`postcss.config.js`** - PostCSS configuration
  - Tailwind CSS
  - Autoprefixer

### Environment Files

- **`.env`** (Frontend) - Not committed to git
  ```env
  VITE_API_URL=http://localhost:5000
  ```

- **`backend/.env`** - Not committed to git
  ```env
  GEMINI_API_KEY=your_api_key_here
  FLASK_ENV=development
  PORT=5000
  CORS_ORIGINS=http://localhost:5173
  ```

### Git Configuration

- **`.gitignore`** - Files to ignore
  - `node_modules/`
  - `dist/`
  - `.env`
  - `__pycache__/`
  - `*.pyc`

---

## Development Workflow

### 1. Starting Development

```bash
# Terminal 1: Start backend
cd backend
python app.py

# Terminal 2: Start frontend
npm run dev
```

### 2. Making Changes

**Frontend Changes:**
1. Edit files in `src/`
2. Hot reload automatically updates browser
3. Check browser console for errors

**Backend Changes:**
1. Edit files in `backend/`
2. Flask auto-reloads in development mode
3. Check terminal for errors

### 3. Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend
pytest
```

### 4. Building for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

### 5. File Organization Best Practices

- **Components**: One component per file
- **Hooks**: Extract reusable logic
- **Utils**: Pure functions only
- **Types**: Shared types in `types/`
- **Tests**: Co-located with source files

---

## Key Design Patterns

### 1. Component Composition
```typescript
<AnimatedSection>
  <GlassCard>
    <Button onClick={handleClick}>
      Click Me
    </Button>
  </GlassCard>
</AnimatedSection>
```

### 2. Custom Hooks
```typescript
const { analysis, isLoading, error, analyze } = useAnalysis();
```

### 3. Error Boundaries
```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 4. API Client Pattern
```typescript
try {
  const result = await analyzeResume(text);
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API error
  }
}
```

---

## Adding New Features

### Adding a New Component

1. Create file in `src/components/`
2. Export from `src/components/index.ts`
3. Add tests in `ComponentName.test.tsx`
4. Update this documentation

### Adding a New API Endpoint

1. Add route in `backend/app.py`
2. Add function in `src/services/apiClient.ts`
3. Add tests in `backend/tests/`
4. Update API documentation

### Adding a New Utility

1. Create file in `src/utils/`
2. Export from `src/utils/index.ts`
3. Add JSDoc comments
4. Add unit tests

---

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change port in `.env` files
   - Kill existing processes

2. **Module not found**
   - Run `npm install`
   - Check import paths

3. **API connection failed**
   - Verify backend is running
   - Check CORS configuration
   - Verify API URL in `.env`

4. **Build errors**
   - Clear `node_modules` and reinstall
   - Clear Vite cache: `rm -rf node_modules/.vite`

---

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Flask Documentation](https://flask.palletsprojects.com)
- [Google Gemini AI](https://ai.google.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

---

**Last Updated**: November 2025
**Version**: 1.0.0
