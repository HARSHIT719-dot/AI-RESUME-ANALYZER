"""
Unit tests for AI Service
Tests response parsing, error handling, and API integration
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from services.ai_service import AIService


class TestAIServiceInitialization:
    """Test AI service initialization"""
    
    def test_init_without_api_key(self):
        """Test initialization fails without API key"""
        with patch.dict('os.environ', {}, clear=True):
            with pytest.raises(ValueError, match="GEMINI_API_KEY not found"):
                AIService()
    
    def test_init_with_api_key_parameter(self):
        """Test initialization with API key parameter"""
        with patch('google.generativeai.configure') as mock_configure:
            with patch('google.generativeai.GenerativeModel') as mock_model:
                service = AIService(api_key="test_key")
                assert service.api_key == "test_key"
                mock_configure.assert_called_once_with(api_key="test_key")
    
    def test_init_with_environment_variable(self):
        """Test initialization with API key from environment"""
        with patch.dict('os.environ', {'GEMINI_API_KEY': 'env_test_key'}):
            with patch('google.generativeai.configure') as mock_configure:
                with patch('google.generativeai.GenerativeModel') as mock_model:
                    service = AIService()
                    assert service.api_key == "env_test_key"
                    mock_configure.assert_called_once_with(api_key="env_test_key")


class TestAnalysisResponseParsing:
    """Test parsing of analysis responses"""
    
    @pytest.fixture
    def ai_service(self):
        """Create AI service instance for testing"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                return AIService(api_key="test_key")
    
    def test_parse_valid_analysis_response(self, ai_service):
        """Test parsing valid JSON analysis response"""
        response_text = """{
            "isPerfect": false,
            "suggestions": ["Add more details", "Fix formatting"],
            "unnecessaryItems": ["Remove redundant info"],
            "summary": "Good resume with minor improvements needed"
        }"""
        result = ai_service._parse_analysis_response(response_text)
        assert result is not None
        assert result['isPerfect'] is False
        assert len(result['suggestions']) == 2
        assert len(result['unnecessaryItems']) == 1
        assert "Good resume" in result['summary']
    
    def test_parse_perfect_resume_response(self, ai_service):
        """Test parsing PERFECT_RESUME indicator"""
        response_text = "PERFECT_RESUME"
        result = ai_service._parse_analysis_response(response_text)
        assert result is not None
        assert result['isPerfect'] is True
        assert result['suggestions'] == []
        assert result['unnecessaryItems'] == []
    
    def test_parse_response_with_markdown_code_blocks(self, ai_service):
        """Test parsing response wrapped in markdown code blocks"""
        response_text = """```json
{
    "isPerfect": false,
    "suggestions": ["Test suggestion"],
    "unnecessaryItems": [],
    "summary": "Test summary"
}
```"""
        result = ai_service._parse_analysis_response(response_text)
        assert result is not None
        assert result['isPerfect'] is False
        assert len(result['suggestions']) == 1
    
    def test_parse_invalid_json_response(self, ai_service):
        """Test parsing invalid JSON returns None"""
        response_text = "This is not valid JSON"
        result = ai_service._parse_analysis_response(response_text)
        assert result is None
    
    def test_parse_response_missing_required_fields(self, ai_service):
        """Test parsing response with missing required fields"""
        response_text = '{"isPerfect": false, "suggestions": []}'
        result = ai_service._parse_analysis_response(response_text)
        assert result is None


class TestQuestionsResponseParsing:
    """Test parsing of interview questions responses"""
    
    @pytest.fixture
    def ai_service(self):
        """Create AI service instance for testing"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                return AIService(api_key="test_key")
    
    def test_parse_valid_questions_response(self, ai_service):
        """Test parsing valid questions response"""
        response_text = """{
            "questions": [
                {
                    "question": "What is your experience with Python?",
                    "category": "technical",
                    "difficulty": "medium"
                },
                {
                    "question": "Tell me about a challenging project",
                    "category": "behavioral",
                    "difficulty": "hard"
                }
            ]
        }"""
        result = ai_service._parse_questions_response(response_text)
        assert result is not None
        assert len(result['questions']) == 2
        assert result['questions'][0]['category'] == "technical"
        assert result['questions'][1]['difficulty'] == "hard"
    
    def test_parse_questions_with_invalid_category(self, ai_service):
        """Test parsing filters out questions with invalid categories"""
        response_text = """{
            "questions": [
                {
                    "question": "Valid question",
                    "category": "technical",
                    "difficulty": "easy"
                },
                {
                    "question": "Invalid question",
                    "category": "invalid_category",
                    "difficulty": "medium"
                }
            ]
        }"""
        result = ai_service._parse_questions_response(response_text)
        assert result is not None
        assert len(result['questions']) == 1
        assert result['questions'][0]['question'] == "Valid question"
    
    def test_parse_questions_with_missing_fields(self, ai_service):
        """Test parsing filters out questions with missing fields"""
        response_text = """{
            "questions": [
                {
                    "question": "Complete question",
                    "category": "experience",
                    "difficulty": "easy"
                },
                {
                    "question": "Incomplete question",
                    "category": "technical"
                }
            ]
        }"""
        result = ai_service._parse_questions_response(response_text)
        assert result is not None
        assert len(result['questions']) == 1
    
    def test_parse_questions_with_no_valid_questions(self, ai_service):
        """Test parsing returns None when no valid questions"""
        response_text = '{"questions": []}'
        result = ai_service._parse_questions_response(response_text)
        assert result is None


class TestAnalyzeResume:
    """Test resume analysis functionality"""
    
    @pytest.fixture
    def ai_service(self):
        """Create AI service instance for testing"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel') as mock_model:
                service = AIService(api_key="test_key")
                service.model = Mock()
                return service
    
    def test_analyze_resume_with_empty_text(self, ai_service):
        """Test analysis with empty resume text"""
        result, error = ai_service.analyze_resume("")
        assert result is None
        assert error == "Resume text cannot be empty"
    
    def test_analyze_resume_success(self, ai_service):
        """Test successful resume analysis"""
        mock_response = Mock()
        mock_response.text = """{
            "isPerfect": false,
            "suggestions": ["Add skills section"],
            "unnecessaryItems": [],
            "summary": "Good resume"
        }"""
        ai_service.model.generate_content = Mock(return_value=mock_response)
        
        result, error = ai_service.analyze_resume("Test resume content")
        assert error is None
        assert result is not None
        assert result['isPerfect'] is False
        assert len(result['suggestions']) == 1
    
    def test_analyze_resume_with_empty_response(self, ai_service):
        """Test analysis with empty AI response"""
        mock_response = Mock()
        mock_response.text = ""
        ai_service.model.generate_content = Mock(return_value=mock_response)
        
        result, error = ai_service.analyze_resume("Test resume")
        assert result is None
        assert error == "Empty response from AI service"
    
    def test_analyze_resume_with_api_error(self, ai_service):
        """Test analysis with API error"""
        ai_service.model.generate_content = Mock(
            side_effect=Exception("API key validation failed")
        )
        
        result, error = ai_service.analyze_resume("Test resume")
        assert result is None
        assert "API key" in error


class TestGenerateQuestions:
    """Test interview questions generation"""
    
    @pytest.fixture
    def ai_service(self):
        """Create AI service instance for testing"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                service = AIService(api_key="test_key")
                service.model = Mock()
                return service
    
    def test_generate_questions_with_empty_text(self, ai_service):
        """Test question generation with empty resume text"""
        result, error = ai_service.generate_questions("")
        assert result is None
        assert error == "Resume text cannot be empty"
    
    def test_generate_questions_success(self, ai_service):
        """Test successful question generation"""
        mock_response = Mock()
        mock_response.text = """{
            "questions": [
                {
                    "question": "What is your experience?",
                    "category": "experience",
                    "difficulty": "medium"
                }
            ]
        }"""
        ai_service.model.generate_content = Mock(return_value=mock_response)
        
        result, error = ai_service.generate_questions("Test resume")
        assert error is None
        assert result is not None
        assert len(result['questions']) == 1
    
    def test_generate_questions_with_context(self, ai_service):
        """Test question generation with analysis context"""
        mock_response = Mock()
        mock_response.text = """{
            "questions": [
                {
                    "question": "Test question",
                    "category": "technical",
                    "difficulty": "easy"
                }
            ]
        }"""
        ai_service.model.generate_content = Mock(return_value=mock_response)
        
        context = {"summary": "Good technical background"}
        result, error = ai_service.generate_questions("Test resume", context)
        assert error is None
        assert result is not None


class TestErrorHandling:
    """Test error handling functionality"""
    
    @pytest.fixture
    def ai_service(self):
        """Create AI service instance for testing"""
        with patch('google.generativeai.configure'):
            with patch('google.generativeai.GenerativeModel'):
                return AIService(api_key="test_key")
    
    def test_handle_api_key_error(self, ai_service):
        """Test handling of API key errors"""
        error = Exception("API key validation failed")
        message = ai_service._handle_ai_error(error)
        assert "API key" in message
    
    def test_handle_rate_limit_error(self, ai_service):
        """Test handling of rate limit errors"""
        error = Exception("Rate limit exceeded")
        message = ai_service._handle_ai_error(error)
        assert "Too many requests" in message
    
    def test_handle_timeout_error(self, ai_service):
        """Test handling of timeout errors"""
        error = Exception("Request timed out")
        message = ai_service._handle_ai_error(error)
        assert "timed out" in message
    
    def test_handle_connection_error(self, ai_service):
        """Test handling of connection errors"""
        error = Exception("Connection failed")
        message = ai_service._handle_ai_error(error)
        assert "Connection failed" in message
    
    def test_handle_generic_error(self, ai_service):
        """Test handling of generic errors"""
        error = Exception("Unknown error")
        message = ai_service._handle_ai_error(error)
        assert "Analysis failed" in message
