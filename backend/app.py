import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime
from services.ai_service import AIService

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configure CORS with proper settings
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
CORS(app, 
     resources={r"/api/*": {"origins": cors_origins}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
app.config['GEMINI_API_KEY'] = os.getenv('GEMINI_API_KEY')

# Initialize AI service
ai_service = None
try:
    ai_service = AIService(app.config['GEMINI_API_KEY'])
    logger.info("AI Service initialized successfully")
except ValueError as e:
    logger.warning(f"AI Service initialization warning: {e}")
except Exception as e:
    logger.error(f"Failed to initialize AI service: {e}", exc_info=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }), 200

# Global error handlers
@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle file too large errors"""
    logger.warning(f"Request entity too large: {error}")
    return jsonify({
        'success': False,
        'error': 'File size exceeds the maximum limit of 10MB',
        'code': 'FILE_TOO_LARGE',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }), 413

@app.errorhandler(400)
def bad_request(error):
    """Handle bad request errors"""
    logger.warning(f"Bad request: {error}")
    return jsonify({
        'success': False,
        'error': 'Bad request. Please check your request format',
        'code': 'BAD_REQUEST',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }), 400

@app.errorhandler(404)
def not_found(error):
    """Handle not found errors"""
    logger.warning(f"Endpoint not found: {request.path}")
    return jsonify({
        'success': False,
        'error': f'Endpoint not found: {request.path}',
        'code': 'NOT_FOUND',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle method not allowed errors"""
    logger.warning(f"Method not allowed: {request.method} {request.path}")
    return jsonify({
        'success': False,
        'error': f'Method {request.method} not allowed for this endpoint',
        'code': 'METHOD_NOT_ALLOWED',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }), 405

@app.errorhandler(500)
def internal_server_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {error}", exc_info=True)
    return jsonify({
        'success': False,
        'error': 'Internal server error. Please try again later',
        'code': 'INTERNAL_SERVER_ERROR',
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    """Analyze resume content and provide suggestions"""
    request_id = datetime.utcnow().isoformat()
    logger.info(f"[{request_id}] Received analyze request")
    
    try:
        # Check if AI service is initialized
        if not ai_service:
            logger.error(f"[{request_id}] AI service not available")
            return jsonify({
                'success': False,
                'error': 'AI service not available. Please check API key configuration',
                'code': 'AI_SERVICE_UNAVAILABLE',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 500
        
        # Validate request content type
        if not request.is_json:
            logger.warning(f"[{request_id}] Invalid content type: {request.content_type}")
            return jsonify({
                'success': False,
                'error': 'Content-Type must be application/json',
                'code': 'INVALID_CONTENT_TYPE',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 400
        
        data = request.get_json()
        
        if not data or 'resumeText' not in data:
            logger.warning(f"[{request_id}] Missing resumeText in request body")
            return jsonify({
                'success': False,
                'error': 'Missing resumeText in request body',
                'code': 'MISSING_RESUME_TEXT',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 400
        
        resume_text = data['resumeText']
        
        if not resume_text or not resume_text.strip():
            logger.warning(f"[{request_id}] Empty resume text provided")
            return jsonify({
                'success': False,
                'error': 'Resume text cannot be empty',
                'code': 'EMPTY_RESUME_TEXT',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 400
        
        # Validate resume text length
        if len(resume_text.strip()) < 50:
            logger.warning(f"[{request_id}] Resume text too short: {len(resume_text)} characters")
            return jsonify({
                'success': False,
                'error': 'Resume text is too short. Please provide a complete resume with at least 50 characters',
                'code': 'RESUME_TOO_SHORT',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 400
        
        logger.info(f"[{request_id}] Calling AI service to analyze resume ({len(resume_text)} characters)")
        
        # Call AI service to analyze resume
        result, error = ai_service.analyze_resume(resume_text)
        
        if error:
            # Handle specific error types
            status_code = 500
            error_code = 'ANALYSIS_FAILED'
            
            if 'API key' in error:
                status_code = 500
                error_code = 'API_KEY_ERROR'
                logger.error(f"[{request_id}] API key error: {error}")
            elif 'rate limit' in error.lower() or 'too many requests' in error.lower():
                status_code = 429
                error_code = 'RATE_LIMIT_EXCEEDED'
                logger.warning(f"[{request_id}] Rate limit exceeded: {error}")
            elif 'timeout' in error.lower():
                status_code = 504
                error_code = 'REQUEST_TIMEOUT'
                logger.warning(f"[{request_id}] Request timeout: {error}")
            elif 'connection' in error.lower():
                status_code = 503
                error_code = 'CONNECTION_FAILED'
                logger.error(f"[{request_id}] Connection failed: {error}")
            else:
                logger.error(f"[{request_id}] Analysis failed: {error}")
            
            return jsonify({
                'success': False,
                'error': error,
                'code': error_code,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), status_code
        
        logger.info(f"[{request_id}] Analysis completed successfully")
        
        # Return successful analysis
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in analyze_resume: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Analysis failed. Please try again',
            'code': 'INTERNAL_ERROR',
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }), 500

@app.route('/api/generate-questions', methods=['POST'])
def generate_questions():
    """Generate interview questions based on resume"""
    request_id = datetime.utcnow().isoformat()
    logger.info(f"[{request_id}] Received generate-questions request")
    
    try:
        # Check if AI service is initialized
        if not ai_service:
            logger.error(f"[{request_id}] AI service not available")
            return jsonify({
                'success': False,
                'error': 'AI service not available. Please check API key configuration',
                'code': 'AI_SERVICE_UNAVAILABLE',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 500
        
        # Validate request content type
        if not request.is_json:
            logger.warning(f"[{request_id}] Invalid content type: {request.content_type}")
            return jsonify({
                'success': False,
                'error': 'Content-Type must be application/json',
                'code': 'INVALID_CONTENT_TYPE',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 400
        
        data = request.get_json()
        
        if not data or 'resumeText' not in data:
            logger.warning(f"[{request_id}] Missing resumeText in request body")
            return jsonify({
                'success': False,
                'error': 'Missing resumeText in request body',
                'code': 'MISSING_RESUME_TEXT',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 400
        
        resume_text = data['resumeText']
        
        if not resume_text or not resume_text.strip():
            logger.warning(f"[{request_id}] Empty resume text provided")
            return jsonify({
                'success': False,
                'error': 'Resume text cannot be empty',
                'code': 'EMPTY_RESUME_TEXT',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 400
        
        # Validate resume text length
        if len(resume_text.strip()) < 50:
            logger.warning(f"[{request_id}] Resume text too short: {len(resume_text)} characters")
            return jsonify({
                'success': False,
                'error': 'Resume text is too short. Please provide a complete resume with at least 50 characters',
                'code': 'RESUME_TOO_SHORT',
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), 400
        
        # Get optional analysis context
        analysis_result = data.get('analysisResult')
        
        logger.info(f"[{request_id}] Calling AI service to generate questions ({len(resume_text)} characters)")
        
        # Call AI service to generate questions
        result, error = ai_service.generate_questions(resume_text, analysis_result)
        
        if error:
            # Handle specific error types
            status_code = 500
            error_code = 'QUESTION_GENERATION_FAILED'
            
            if 'API key' in error:
                status_code = 500
                error_code = 'API_KEY_ERROR'
                logger.error(f"[{request_id}] API key error: {error}")
            elif 'rate limit' in error.lower() or 'too many requests' in error.lower():
                status_code = 429
                error_code = 'RATE_LIMIT_EXCEEDED'
                logger.warning(f"[{request_id}] Rate limit exceeded: {error}")
            elif 'timeout' in error.lower():
                status_code = 504
                error_code = 'REQUEST_TIMEOUT'
                logger.warning(f"[{request_id}] Request timeout: {error}")
            elif 'connection' in error.lower():
                status_code = 503
                error_code = 'CONNECTION_FAILED'
                logger.error(f"[{request_id}] Connection failed: {error}")
            else:
                logger.error(f"[{request_id}] Question generation failed: {error}")
            
            return jsonify({
                'success': False,
                'error': error,
                'code': error_code,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }), status_code
        
        logger.info(f"[{request_id}] Question generation completed successfully")
        
        # Return successful question generation
        return jsonify({
            'success': True,
            'data': result
        }), 200
        
    except Exception as e:
        logger.error(f"[{request_id}] Unexpected error in generate_questions: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Question generation failed. Please try again',
            'code': 'INTERNAL_ERROR',
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
