"""
AI Service Module
Handles integration with Google Gemini AI for resume analysis and question generation
"""

import json
import os
import logging
from typing import Dict, List, Optional, Tuple
import google.generativeai as genai

# Configure logging
logger = logging.getLogger(__name__)


class AIService:
    """Service for handling AI operations using Google Gemini"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize AI service with Gemini API key
        
        Args:
            api_key: Google Gemini API key (if None, reads from environment)
        """
        self.api_key = api_key or os.getenv('GEMINI_API_KEY')
        
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables. AI Service running in MOCK mode.")
            return # Don't raise error, just return to skip configuration
        
        try:
            # Configure Gemini AI
            genai.configure(api_key=self.api_key)
            
            # Initialize the model - using gemini-2.5-flash for free tier
            self.model = genai.GenerativeModel('gemini-pro')
            logger.info("Gemini AI model initialized successfully with gemini-pro")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini AI model: {e}", exc_info=True)
            raise
    
    def analyze_resume(self, resume_text: str) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Analyze resume content and provide suggestions
        
        Args:
            resume_text: The text content of the resume
            
        Returns:
            Tuple of (analysis_result, error_message)
            - (result_dict, None) if successful
            - (None, error_message) if failed
        """
        if not resume_text or not resume_text.strip():
            return None, "Resume text cannot be empty"
        
        # Use mock data if API key is not configured or for testing
        if not self.api_key:
            logger.warning("No API key configured. Using mock data for analysis.")
            return self._get_mock_analysis_result(), None

        # Construct the analysis prompt
        prompt = f"""You are an expert ATS (Applicant Tracking System) analyzer and HR professional. Analyze the provided resume PDF content with brutal honesty.

Resume Content:
{resume_text}

Provide a detailed analysis in the following JSON format:

{{
  "isPerfect": boolean, // true ONLY if the resume is exceptional (95+ score)
  "overallScore": number, // 0-100 integer representing ATS compatibility
  "summary": "Brief executive summary of the resume quality (2-3 sentences)",
  "suggestions": ["Specific, actionable content improvement 1", "Content improvement 2", ...],
  "unnecessaryItems": ["Item to remove 1", "Item to remove 2", ...],
  "strengths": ["Strong point 1", "Strong point 2", ...],
  "formattingFeedback": ["Font choice feedback", "Margins/Spacing feedback", "Section organization feedback", ...],
  "keywordAnalysis": {{
    "score": number, // 0-100
    "missingKeywords": ["keyword1", "keyword2", ...],
    "presentKeywords": ["keyword3", "keyword4", ...]
  }}
}}

Special Instruction: The resume text provided is extracted from a PDF. Ignore simple formatting artifacts. Focus on content quality, impact, and ATS keywords.
Important: Return ONLY valid JSON."""
        
        try:
            # Generate response from AI
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                return None, "Empty response from AI service"
            
            # Parse the AI response
            result = self._parse_analysis_response(response.text)
            
            if result is None:
                return None, "Failed to parse AI response"
            
            return result, None
            
        except Exception as e:
            # Fallback to mock data on error if strictly needed (optional, but good for stability)
            # For now, we return the error to let the user know, unless it's just an API key issue handled above.
            error_message = self._handle_ai_error(e)
            return None, error_message

    def _get_mock_analysis_result(self) -> Dict:
        """Return a mock analysis result for demonstration/testing"""
        return {
            'isPerfect': False,
            'overallScore': 72,
            'summary': "This is a solid resume with good technical foundation, but it lacks quantifiable achievements and proper ATS optimization.",
            'suggestions': [
                " Quantify your achievements (e.g., 'Increased efficiency by 20%').",
                "Start bullet points with strong action verbs (e.g., 'Spearheaded', 'Optimized').",
                "Tailor your skills section to match the job description more closely."
            ],
            'unnecessaryItems': [
                "Full address (City, State is sufficient).",
                "References available upon request (this is outdated).",
                "Objective statement (use a Professional Summary instead)."
            ],
            'strengths': [
                "Clear education section.",
                "Relevant technical skills listed.",
                "Good use of reverse chronological order."
            ],
            'formattingFeedback': [
                "Consider using a more modern, sans-serif font like Inter or Roboto.",
                "Ensure margins are at least 0.5 inches on all sides.",
                "Use consistent bullet point styling throughout."
            ],
            'keywordAnalysis': {
                'score': 65,
                'missingKeywords': ["Agile", "Scrum", "CI/CD", "Project Management"],
                'presentKeywords': ["Python", "React", "JavaScript", "SQL"]
            }
        }
    
    def generate_questions(self, resume_text: str, analysis_context: Optional[Dict] = None) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Generate interview questions based on resume content
        
        Args:
            resume_text: The text content of the resume
            analysis_context: Optional context from previous analysis
            
        Returns:
            Tuple of (questions_result, error_message)
            - (result_dict, None) if successful
            - (None, error_message) if failed
        """
        if not self.api_key:
             return self._get_mock_questions_result(), None

        if not resume_text or not resume_text.strip():
            return None, "Resume text cannot be empty"
        
        # Build context string if provided
        context_str = ""
        if analysis_context and 'summary' in analysis_context:
            context_str = f"\n\nContext from analysis:\n{analysis_context['summary']}"
        
        # Construct the questions prompt
        prompt = f"""Based on the following resume, generate 5-10 relevant interview questions that a hiring manager might ask. Include a mix of technical, behavioral, and experience-based questions.

Resume content:
{resume_text}{context_str}

Provide your response in the following JSON format:
{{
  "questions": [
    {{
      "question": "question text",
      "category": "technical|behavioral|experience",
      "difficulty": "easy|medium|hard"
    }}
  ]
}}

Important: Return ONLY valid JSON, no additional text or markdown formatting. Generate between 5-10 questions."""
        
        try:
            # Generate response from AI
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                return None, "Empty response from AI service"
            
            # Parse the AI response
            result = self._parse_questions_response(response.text)
            
            if result is None:
                return None, "Failed to parse AI response"
            
            return result, None
            
        except Exception as e:
            error_message = self._handle_ai_error(e)
            return None, error_message

    def _get_mock_questions_result(self) -> Dict:
        """Return mock interview questions"""
        return {
            "questions": [
                {
                    "question": "Can you explain a challenging bug you encountered in your React project and how you solved it?",
                    "category": "technical",
                    "difficulty": "medium"
                },
                {
                    "question": "Describe a time you had to learn a new technology quickly to meet a deadline.",
                    "category": "behavioral",
                    "difficulty": "easy"
                },
                {
                    "question": "How do you approach optimizing database queries for performance?",
                    "category": "technical",
                    "difficulty": "hard"
                },
                {
                     "question": "Tell me about your experience working in an Agile team environment.",
                     "category": "experience",
                     "difficulty": "easy"
                },
                {
                    "question": "What is your process for code review and ensuring code quality?",
                    "category": "technical",
                    "difficulty": "medium"
                }
            ]
        }
    
    def _parse_analysis_response(self, response_text: str) -> Optional[Dict]:
        """
        Parse AI response for resume analysis
        
        Args:
            response_text: Raw text response from AI
            
        Returns:
            Parsed dictionary or None if parsing fails
        """
        try:
            # Clean the response text
            cleaned_text = self._clean_json_response(response_text)
            
            # Check for perfect resume indicator
            if "PERFECT_RESUME" in response_text:
                logger.info("AI detected perfect resume")
                return {
                    'isPerfect': True,
                    'overallScore': 98,
                    'summary': 'Your resume is well-written and professional.',
                    'suggestions': [],
                    'unnecessaryItems': [],
                    'strengths': ['Everything looks great!'],
                    'formattingFeedback': ['Format is excellent.'],
                    'keywordAnalysis': {'score': 100, 'missingKeywords': [], 'presentKeywords': []}
                }
            
            # Parse JSON
            parsed = json.loads(cleaned_text)
            
            # Validate required fields
            required_fields = ['isPerfect', 'suggestions', 'unnecessaryItems', 'summary', 'overallScore']
            if not all(field in parsed for field in required_fields):
                logger.error(f"Missing required fields in AI response. Found fields: {list(parsed.keys())}")
                # Try to salvage partial response if possible, or just fail
                return None
            
            # Ensure lists are actually lists
            for field in ['suggestions', 'unnecessaryItems', 'strengths', 'formattingFeedback']:
                if field not in parsed:
                    parsed[field] = []
                elif not isinstance(parsed[field], list):
                    logger.warning(f"{field} field is not a list, converting to empty list")
                    parsed[field] = []

            # Ensure keywordAnalysis structure
            if 'keywordAnalysis' not in parsed or not isinstance(parsed['keywordAnalysis'], dict):
                 parsed['keywordAnalysis'] = {'score': 0, 'missingKeywords': [], 'presentKeywords': []}

            
            # Ensure isPerfect is boolean
            if not isinstance(parsed['isPerfect'], bool):
                logger.warning("isPerfect field is not a boolean, defaulting to False")
                parsed['isPerfect'] = False
            
            logger.info(f"Successfully parsed analysis response: Score {parsed.get('overallScore')}")
            return parsed
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            logger.debug(f"Response text: {response_text[:500]}...")  # Log first 500 chars
            return None
        except Exception as e:
            logger.error(f"Error parsing analysis response: {e}", exc_info=True)
            return None
    
    def _parse_questions_response(self, response_text: str) -> Optional[Dict]:
        """
        Parse AI response for interview questions
        
        Args:
            response_text: Raw text response from AI
            
        Returns:
            Parsed dictionary or None if parsing fails
        """
        try:
            # Clean the response text
            cleaned_text = self._clean_json_response(response_text)
            
            # Parse JSON
            parsed = json.loads(cleaned_text)
            
            # Validate required fields
            if 'questions' not in parsed or not isinstance(parsed['questions'], list):
                logger.error(f"Invalid questions format in AI response. Found keys: {list(parsed.keys()) if isinstance(parsed, dict) else 'not a dict'}")
                return None
            
            # Validate each question
            valid_questions = []
            invalid_count = 0
            for i, q in enumerate(parsed['questions']):
                if isinstance(q, dict) and 'question' in q and 'category' in q and 'difficulty' in q:
                    # Validate category and difficulty values
                    if q['category'] in ['technical', 'behavioral', 'experience'] and \
                       q['difficulty'] in ['easy', 'medium', 'hard']:
                        valid_questions.append(q)
                    else:
                        invalid_count += 1
                        logger.warning(f"Question {i} has invalid category or difficulty: {q.get('category')}, {q.get('difficulty')}")
                else:
                    invalid_count += 1
                    logger.warning(f"Question {i} is missing required fields")
            
            # Ensure we have at least some questions
            if not valid_questions:
                logger.error("No valid questions found in AI response")
                return None
            
            if invalid_count > 0:
                logger.warning(f"Filtered out {invalid_count} invalid questions")
            
            logger.info(f"Successfully parsed {len(valid_questions)} valid questions")
            return {'questions': valid_questions}
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            logger.debug(f"Response text: {response_text[:500]}...")  # Log first 500 chars
            return None
        except Exception as e:
            logger.error(f"Error parsing questions response: {e}", exc_info=True)
            return None
    
    def _clean_json_response(self, response_text: str) -> str:
        """
        Clean AI response text to extract valid JSON
        
        Args:
            response_text: Raw response text
            
        Returns:
            Cleaned JSON string
        """
        # Remove markdown code blocks if present
        text = response_text.strip()
        
        if text.startswith('```json'):
            text = text[7:]
        elif text.startswith('```'):
            text = text[3:]
        
        if text.endswith('```'):
            text = text[:-3]
        
        # Find JSON object boundaries
        start_idx = text.find('{')
        end_idx = text.rfind('}')
        
        if start_idx != -1 and end_idx != -1:
            text = text[start_idx:end_idx + 1]
        
        return text.strip()
    
    def _handle_ai_error(self, error: Exception) -> str:
        """
        Handle AI service errors and return appropriate error message
        
        Args:
            error: The exception that occurred
            
        Returns:
            User-friendly error message
        """
        error_str = str(error).lower()
        
        # API key errors
        if 'api key' in error_str or 'authentication' in error_str or 'unauthorized' in error_str:
            logger.error(f"API key error: {error}")
            return "API key validation failed"
        
        # Rate limiting errors
        if 'rate limit' in error_str or 'quota' in error_str or '429' in error_str:
            logger.warning(f"Rate limit error: {error}")
            return "Too many requests. Please wait a moment and try again"
        
        # Timeout errors
        if 'timeout' in error_str or 'timed out' in error_str:
            logger.warning(f"Timeout error: {error}")
            return "Request timed out. Please try again"
        
        # Network errors
        if 'connection' in error_str or 'network' in error_str:
            logger.error(f"Network error: {error}")
            return "Connection failed. Please check your internet connection"
        
        # Generic error
        logger.error(f"AI service error: {error}", exc_info=True)
        return "Analysis failed. Please try again"
