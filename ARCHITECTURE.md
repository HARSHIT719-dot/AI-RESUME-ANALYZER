# Architecture Overview - AI Resume Analyzer

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Application                        │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │   Upload     │  │   Analysis   │  │  Questions   │    │ │
│  │  │  Component   │  │   Results    │  │   Display    │    │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘    │ │
│  │         │                  │                  │            │ │
│  │         └──────────────────┴──────────────────┘            │ │
│  │                            │                                │ │
│  │                    ┌───────▼────────┐                      │ │
│  │                    │  API Client    │                      │ │
│  │                    │  (apiClient.ts)│                      │ │
│  │                    └───────┬────────┘                      │ │
│  └────────────────────────────┼─────────────────────────────┘ │
└─────────────────────────────────┼───────────────────────────────┘
                                  │ HTTP/JSON
                                  │
┌─────────────────────────────────▼───────────────────────────────┐
│                      Flask Backend Server                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Flask Application                        │ │
│  │                        (app.py)                             │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │ │
│  │  │ POST /analyze│  │POST /generate│  │ GET /health  │    │ │
│  │  │              │  │  -questions  │  │              │    │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────────┘    │ │
│  │         │                  │                                │ │
│  │         └──────────────────┴──────────────────┐            │ │
│  │                                                │            │ │
│  │                    ┌───────────────────────────▼──────┐    │ │
│  │                    │      AI Service                  │    │ │
│  │                    │   (ai_service.py)                │    │ │
│  │                    │                                  │    │ │
│  │                    │  - analyze_resume()              │    │ │
│  │                    │  - generate_questions()          │    │ │
│  │                    └───────────┬──────────────────────┘    │ │
│  └────────────────────────────────┼─────────────────────────┘ │
└─────────────────────────────────────┼───────────────────────────┘
                                      │ API Call
                                      │
┌─────────────────────────────────────▼───────────────────────────┐
│                    Google Gemini AI API                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Gemini 2.5 Flash Model                         │ │
│  │                                                             │ │
│  │  - Natural Language Processing                             │ │
│  │  - Resume Analysis                                         │ │
│  │  - Question Generation                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Resume Upload & Analysis Flow

```
User Action                Frontend                Backend                 AI Service
    │                         │                       │                        │
    ├─ Upload PDF ──────────→ │                       │                        │
    │                         │                       │                        │
    │                         ├─ Extract Text         │                        │
    │                         │   (PDF.js)            │                        │
    │                         │                       │                        │
    │                         ├─ POST /api/analyze ──→│                        │
    │                         │   {resumeText}        │                        │
    │                         │                       │                        │
    │                         │                       ├─ analyze_resume() ───→│
    │                         │                       │   (resume_text)        │
    │                         │                       │                        │
    │                         │                       │                        ├─ Process
    │                         │                       │                        │   with AI
    │                         │                       │                        │
    │                         │                       │←─ Analysis Result ─────┤
    │                         │                       │   {suggestions, etc}   │
    │                         │                       │                        │
    │                         │←─ JSON Response ──────┤                        │
    │                         │   {success, data}     │                        │
    │                         │                       │                        │
    │←─ Display Results ──────┤                       │                        │
    │   (AnalysisResults)     │                       │                        │
```

### 2. Interview Questions Generation Flow

```
User Action                Frontend                Backend                 AI Service
    │                         │                       │                        │
    ├─ Click "Generate" ─────→│                       │                        │
    │   Questions             │                       │                        │
    │                         │                       │                        │
    │                         ├─ POST /api/          │                        │
    │                         │   generate-questions ─→│                        │
    │                         │   {resumeText,        │                        │
    │                         │    analysisResult}    │                        │
    │                         │                       │                        │
    │                         │                       ├─ generate_questions()─→│
    │                         │                       │   (resume, analysis)   │
    │                         │                       │                        │
    │                         │                       │                        ├─ Generate
    │                         │                       │                        │   Questions
    │                         │                       │                        │
    │                         │                       │←─ Questions Array ─────┤
    │                         │                       │   [{question, etc}]    │
    │                         │                       │                        │
    │                         │←─ JSON Response ──────┤                        │
    │                         │   {success, data}     │                        │
    │                         │                       │                        │
    │←─ Display Questions ────┤                       │                        │
    │   (InterviewQuestions)  │                       │                        │
```

## Component Hierarchy

```
App.tsx
│
├── ErrorBoundary
│   │
│   ├── AnimatedBackground
│   │
│   ├── Header
│   │
│   ├── Main Content
│   │   │
│   │   ├── UploadContainer
│   │   │   │
│   │   │   └── UploadZone
│   │   │       └── (Drag & Drop Area)
│   │   │
│   │   ├── SplitLayout (when file uploaded)
│   │   │   │
│   │   │   ├── PDFPreview
│   │   │   │   ├── Canvas (PDF rendering)
│   │   │   │   └── Controls (zoom, navigate)
│   │   │   │
│   │   │   └── AnalysisResults
│   │   │       ├── LoadingSkeleton (while loading)
│   │   │       ├── FunLoadingMessages
│   │   │       ├── Summary
│   │   │       ├── Suggestions List
│   │   │       ├── Unnecessary Items List
│   │   │       └── Generate Questions Button
│   │   │
│   │   └── InterviewQuestions (after generation)
│   │       ├── Search Bar
│   │       ├── Category Filters
│   │       └── QuestionCard (for each question)
│   │           ├── Question Text
│   │           ├── Category Badge
│   │           ├── Difficulty Badge
│   │           └── Copy Button
│   │
│   ├── Footer
│   │
│   └── OfflineIndicator
│
└── (Global Providers & Context)
```

## State Management

### Frontend State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Component State                         │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Upload State  │  │ Analysis State │  │ Questions    │  │
│  │                │  │                │  │ State        │  │
│  │  - file        │  │  - result      │  │  - questions │  │
│  │  - isUploading │  │  - isLoading   │  │  - isLoading │  │
│  │  - error       │  │  - error       │  │  - error     │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│         │                    │                    │          │
│         └────────────────────┴────────────────────┘          │
│                              │                                │
│                    ┌─────────▼─────────┐                     │
│                    │   useAnalysis()   │                     │
│                    │   Custom Hook     │                     │
│                    └─────────┬─────────┘                     │
│                              │                                │
│                    ┌─────────▼─────────┐                     │
│                    │   API Client      │                     │
│                    │   (apiClient.ts)  │                     │
│                    └───────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Details

### Frontend Technologies

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Stack                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ React 18 + TypeScript                                │  │
│  │  - Component-based architecture                      │  │
│  │  - Type safety with TypeScript                       │  │
│  │  - Hooks for state management                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Vite                                                  │  │
│  │  - Fast HMR (Hot Module Replacement)                 │  │
│  │  - Optimized builds                                  │  │
│  │  - Code splitting                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tailwind CSS                                          │  │
│  │  - Utility-first CSS                                 │  │
│  │  - Custom dark theme                                 │  │
│  │  - Responsive design                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Framer Motion                                         │  │
│  │  - Smooth animations                                 │  │
│  │  - Gesture support                                   │  │
│  │  - Layout animations                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PDF.js                                                │  │
│  │  - PDF rendering                                     │  │
│  │  - Text extraction                                   │  │
│  │  - Page navigation                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Backend Technologies

```
┌─────────────────────────────────────────────────────────────┐
│                      Backend Stack                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Flask 2.3                                             │  │
│  │  - Lightweight web framework                         │  │
│  │  - RESTful API design                                │  │
│  │  - Easy routing                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Google Gemini AI                                      │  │
│  │  - Model: gemini-2.5-flash                           │  │
│  │  - Natural language processing                       │  │
│  │  - Free tier support                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ PyPDF2                                                │  │
│  │  - PDF text extraction                               │  │
│  │  - Multiple format support                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Flask-CORS                                            │  │
│  │  - Cross-origin resource sharing                     │  │
│  │  - Security configuration                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations

### API Key Security
- ✅ API keys stored in `.env` files (not committed)
- ✅ Environment variables used for configuration
- ✅ `.gitignore` prevents accidental commits

### CORS Configuration
- ✅ Specific origins allowed (not wildcard)
- ✅ Credentials support enabled
- ✅ Specific headers and methods allowed

### Input Validation
- ✅ File type validation (PDF only)
- ✅ File size limits (10MB max)
- ✅ Text length validation
- ✅ Error handling for malformed requests

## Performance Optimizations

### Frontend
- ✅ Code splitting by route
- ✅ Lazy loading of components
- ✅ Image optimization
- ✅ CSS purging (Tailwind)
- ✅ Minification and compression
- ✅ Reduced motion support

### Backend
- ✅ Request timeout handling
- ✅ Error caching
- ✅ Efficient PDF processing
- ✅ Logging for debugging

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Production Setup                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Frontend (Static Files)                              │  │
│  │  - Deployed to: Vercel / Netlify / AWS S3           │  │
│  │  - CDN: CloudFlare / AWS CloudFront                 │  │
│  │  - HTTPS enabled                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Backend (Flask API)                                  │  │
│  │  - Deployed to: Heroku / AWS / Google Cloud         │  │
│  │  - WSGI server: Gunicorn                            │  │
│  │  - HTTPS enabled                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Environment Variables                                │  │
│  │  - Managed by hosting platform                      │  │
│  │  - Secure storage                                    │  │
│  │  - No .env files in production                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

**For more details, see:**
- [README.md](./README.md) - General overview
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Detailed file structure
- [QUICK_START.md](./QUICK_START.md) - Quick setup guide
