# Quick Start Guide - AI Resume Analyzer

Get up and running in 5 minutes! 🚀

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Python 3.9+ installed
- [ ] Google Gemini API key ([Get free key](https://makersuite.google.com/app/apikey))

## Setup Steps

### 1️⃣ Install Frontend Dependencies (1 min)

```bash
npm install
```

### 2️⃣ Configure Frontend Environment (30 sec)

Create `.env` file in root directory:

```env
VITE_API_URL=http://localhost:5000
```

### 3️⃣ Configure Backend Environment (1 min)

Create `backend/.env` file:

```env
GEMINI_API_KEY=your_actual_api_key_here
FLASK_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:5173
```

**⚠️ Important**: Replace `your_actual_api_key_here` with your real API key!

### 4️⃣ Install Backend Dependencies (1 min)

```bash
cd backend
pip install -r requirements.txt
```

### 5️⃣ Start Backend Server (30 sec)

```bash
# From backend directory
python app.py
```

You should see:
```
✓ Gemini AI model initialized successfully
✓ Running on http://127.0.0.1:5000
```

### 6️⃣ Start Frontend (30 sec)

Open a **new terminal** and run:

```bash
npm run dev
```

You should see:
```
  VITE ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

### 7️⃣ Open Browser

Visit: **http://localhost:5173**

---

## Quick Test

1. **Upload a PDF resume** (drag & drop or click to browse)
2. **Wait for AI analysis** (15-30 seconds)
3. **View suggestions** and improvements
4. **Generate interview questions** (click the button)
5. **Browse questions** by category

---

## Common Issues & Fixes

### ❌ "Cannot connect to backend"
**Fix**: Make sure backend is running on port 5000
```bash
cd backend
python app.py
```

### ❌ "API key error"
**Fix**: Check your `backend/.env` file has the correct API key
```env
GEMINI_API_KEY=AIzaSy...  # Your actual key
```

### ❌ "Module not found"
**Fix**: Reinstall dependencies
```bash
# Frontend
npm install

# Backend
cd backend
pip install -r requirements.txt
```

### ❌ "Port already in use"
**Fix**: Change port in `backend/.env`
```env
PORT=5001  # Use different port
```
Then update frontend `.env`:
```env
VITE_API_URL=http://localhost:5001
```

---

## Project Structure (Quick Reference)

```
📦 AI-Resume-Analyzer
├── 📁 src/                    # Frontend React code
│   ├── components/            # UI components
│   ├── hooks/                 # Custom hooks
│   ├── services/              # API client
│   └── utils/                 # Helper functions
├── 📁 backend/                # Python Flask API
│   ├── services/              # AI & PDF services
│   ├── app.py                 # Main Flask app
│   └── .env                   # API keys (create this!)
├── .env                       # Frontend config (create this!)
└── package.json               # Dependencies
```

---

## Development Commands

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm test         # Run tests
npm run preview  # Preview production build
```

### Backend
```bash
python app.py    # Start Flask server
pytest           # Run tests
```

---

## Features Overview

### 🎨 UI Features
- Dark theme with glassmorphism
- Smooth animations
- Responsive design (mobile-friendly)
- Fun loading messages

### 🤖 AI Features
- Resume analysis with suggestions
- Identifies unnecessary content
- Generates interview questions
- Categorizes questions (Technical, Behavioral, Experience)

### 📄 PDF Features
- Drag & drop upload
- PDF preview with zoom
- Page navigation
- Text extraction

---

## Next Steps

1. ✅ **Read Full Documentation**: [README.md](./README.md)
2. ✅ **Understand Structure**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
3. ✅ **Explore Code**: Start with `src/App.tsx`
4. ✅ **Make Changes**: Try modifying a component
5. ✅ **Run Tests**: `npm test` and `pytest`

---

## Getting Help

- 📖 **Full Documentation**: See [README.md](./README.md)
- 🏗️ **Project Structure**: See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- 🐛 **Found a Bug**: Open an issue on GitHub
- 💡 **Have Questions**: Check the troubleshooting section

---

## Tips for Success

1. **Always run backend first**, then frontend
2. **Check terminal logs** for errors
3. **Use browser DevTools** to debug frontend
4. **Keep API key secure** - never commit `.env` files
5. **Test with different PDFs** to see various results

---

**Happy Coding! 🎉**

Need more details? Check out the full [README.md](./README.md) and [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
