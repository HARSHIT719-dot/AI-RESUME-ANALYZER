# AI Resume Analyzer - Backend API

Python Flask backend service for the AI Resume Analyzer application. This service handles resume analysis using Google's Gemini AI API and provides RESTful endpoints for the frontend application.

## Features

- Resume text analysis with AI-powered suggestions
- Interview question generation based on resume content
- RESTful API with JSON responses
- Comprehensive error handling and logging
- CORS support for frontend integration
- Health check endpoint for monitoring

## Prerequisites

- Python 3.9 or higher
- pip (Python package manager)
- Google Gemini API key (free tier available at [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

### 1. Navigate to the backend directory

```bash
cd backend
```

### 2. Create a virtual environment (recommended)

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the backend directory (see [Environment Variables](#environment-variables) section below):

```bash
cp .env.example .env
```

Edit the `.env` file and add your Google Gemini API key:

```
GEMINI_API_KEY=your_actual_api_key_here
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes | None |
| `FLASK_ENV` | Flask environment (development/production) | No | production |
| `PORT` | Port number for the server | No | 5000 |
| `CORS_ORIGINS` | Comma-separated list of allowed CORS origins | No | http://localhost:5173 |

**Example `.env` file:**

```env
GEMINI_API_KEY=AIzaSyD...your_key_here
FLASK_ENV=development
PORT=5000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Running the Server

### Development Mode

```bash
python app.py
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

### Production Mode

Set `FLASK_ENV=production` in your `.env` file, then:

```bash
python app.py
```

For production deployment, consider using a production WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### 1. Health Check

Check if the API is running.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example:**
```bash
curl http://localhost:5000/api/health
```

---

### 2. Analyze Resume

Analyze resume content and receive AI-powered suggestions for improvement.

**Endpoint:** `POST /api/analyze`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "resumeText": "Your resume content here..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      "Add quantifiable achievements to your work experience",
      "Include relevant technical skills section"
    ],
    "unnecessaryItems": [
      "Remove outdated skills like Windows XP"
    ],
    "isPerfect": false,
    "summary": "Your resume shows strong experience but could benefit from more specific metrics."
  }
}
```

**Perfect Resume Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "suggestions": [],
    "unnecessaryItems": [],
    "isPerfect": true,
    "summary": "Your resume is well-structured and comprehensive."
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"resumeText": "John Doe\nSoftware Engineer\n..."}'
```

---

### 3. Generate Interview Questions

Generate relevant interview questions based on resume content.

**Endpoint:** `POST /api/generate-questions`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "resumeText": "Your resume content here...",
  "analysisResult": {
    "summary": "Optional analysis summary for context"
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question": "Can you explain your experience with React and how you've used it in production?",
        "category": "technical",
        "difficulty": "medium"
      },
      {
        "question": "Tell me about a time when you had to debug a complex issue in production.",
        "category": "behavioral",
        "difficulty": "medium"
      },
      {
        "question": "What was your role in the e-commerce platform project mentioned in your resume?",
        "category": "experience",
        "difficulty": "easy"
      }
    ]
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"resumeText": "John Doe\nSoftware Engineer\n..."}'
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_RESUME_TEXT` | 400 | Request body missing `resumeText` field |
| `EMPTY_RESUME_TEXT` | 400 | Resume text is empty or contains only whitespace |
| `RESUME_TOO_SHORT` | 400 | Resume text is less than 50 characters |
| `INVALID_CONTENT_TYPE` | 400 | Request Content-Type is not application/json |
| `FILE_TOO_LARGE` | 413 | Request body exceeds 10MB limit |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests to AI service |
| `AI_SERVICE_UNAVAILABLE` | 500 | AI service not initialized (check API key) |
| `API_KEY_ERROR` | 500 | Invalid or missing Gemini API key |
| `CONNECTION_FAILED` | 503 | Failed to connect to AI service |
| `REQUEST_TIMEOUT` | 504 | AI service request timed out |
| `ANALYSIS_FAILED` | 500 | Resume analysis failed |
| `QUESTION_GENERATION_FAILED` | 500 | Question generation failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Project Structure

```
backend/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables (create this)
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── services/
    └── ai_service.py     # AI service for Gemini integration
```

## Dependencies

- **Flask** (3.0.0): Web framework
- **Flask-CORS** (4.0.0): Cross-Origin Resource Sharing support
- **PyPDF2** (3.0.1): PDF processing (for future file upload support)
- **google-generativeai** (0.3.2): Google Gemini AI SDK
- **python-dotenv** (1.0.0): Environment variable management

## Troubleshooting

### Issue: "AI service not available" error

**Cause:** Missing or invalid Gemini API key.

**Solution:**
1. Verify your `.env` file exists in the backend directory
2. Check that `GEMINI_API_KEY` is set correctly
3. Get a valid API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. Restart the server after updating the `.env` file

---

### Issue: CORS errors in browser console

**Cause:** Frontend origin not allowed by CORS configuration.

**Solution:**
1. Add your frontend URL to `CORS_ORIGINS` in `.env`:
   ```
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```
2. Restart the server

---

### Issue: "Rate limit exceeded" errors

**Cause:** Too many requests to Gemini API in a short time.

**Solution:**
1. Wait a few moments before retrying
2. The free tier has rate limits - consider upgrading if needed
3. Implement request caching on the frontend to reduce API calls

---

### Issue: Server won't start - "Address already in use"

**Cause:** Another process is using port 5000.

**Solution:**
1. Change the port in `.env`:
   ```
   PORT=5001
   ```
2. Or stop the process using port 5000:
   - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
   - macOS/Linux: `lsof -ti:5000 | xargs kill -9`

---

### Issue: Import errors or module not found

**Cause:** Dependencies not installed or virtual environment not activated.

**Solution:**
1. Ensure virtual environment is activated:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
2. Reinstall dependencies: `pip install -r requirements.txt`

---

### Issue: "Resume text too short" error

**Cause:** Resume content is less than 50 characters.

**Solution:**
Ensure the resume text being sent contains meaningful content (at least 50 characters).

---

### Issue: Timeout errors

**Cause:** AI service taking too long to respond.

**Solution:**
1. Check your internet connection
2. Try again - the AI service may be experiencing high load
3. Consider implementing longer timeout values if this persists

## Logging

The application logs important events and errors to the console. Log levels:

- **INFO**: Normal operations (requests, successful responses)
- **WARNING**: Non-critical issues (rate limits, validation errors)
- **ERROR**: Critical errors (AI service failures, unexpected exceptions)

Logs include timestamps and request IDs for tracking.

## Development

### Running Tests

Tests are located in the project root. To run backend tests:

```bash
# Install test dependencies if needed
pip install pytest pytest-flask

# Run tests
pytest
```

### Code Style

This project follows PEP 8 style guidelines. Format code using:

```bash
pip install black
black .
```

## Deployment

### Environment Setup

1. Set `FLASK_ENV=production` in your `.env` file
2. Use a production WSGI server (Gunicorn recommended)
3. Set appropriate `CORS_ORIGINS` for your production frontend domain
4. Consider using environment variables from your hosting platform instead of `.env` file

### Recommended Hosting Platforms

- **Railway**: Easy Python deployment with automatic HTTPS
- **Heroku**: Classic PaaS with Python support
- **AWS Elastic Beanstalk**: Scalable AWS deployment
- **Google Cloud Run**: Serverless container deployment
- **DigitalOcean App Platform**: Simple deployment with managed infrastructure

### Production Checklist

- [ ] Set `FLASK_ENV=production`
- [ ] Use production WSGI server (Gunicorn)
- [ ] Configure production `CORS_ORIGINS`
- [ ] Set up proper logging and monitoring
- [ ] Implement rate limiting
- [ ] Use HTTPS
- [ ] Set up health check monitoring
- [ ] Configure proper error tracking (e.g., Sentry)

## Security Considerations

- Never commit `.env` file to version control
- Keep your Gemini API key secure
- Use HTTPS in production
- Implement rate limiting to prevent abuse
- Validate and sanitize all user inputs
- Keep dependencies up to date

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the API documentation above
3. Check application logs for error details
4. Verify environment variables are set correctly

## License

This project is part of the AI Resume Analyzer application.
