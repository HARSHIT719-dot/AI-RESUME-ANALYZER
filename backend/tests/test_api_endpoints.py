"""
Integration tests for API endpoints
Tests /api/analyze, /api/generate-questions, and /api/health endpoints
"""

import pytest
import json
from unittest.mock import Mock, patch
from app import app


@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_ai_service():
    """Mock AI service for testing"""
    with patch('app.ai_service') as mock_service:
        yield mock_service


class TestHealthEndpoint:
    """Test /api/health endpoint"""
    
    def test_health_check_returns_200(self, client):
        """Test health endpoint returns 200 status"""
        response = client.get('/api/health')
        assert response.status_code == 200
    
    def test_health_check_returns_json(self, client):
        """Test health endpoint returns JSON"""
        response = client.get('/api/health')
        data = json.loads(response.data)
        assert 'status' in data
        assert 'timestamp' in data
        assert data['status'] == 'healthy'
    
    def test_health_check_timestamp_format(self, client):
        """Test health endpoint timestamp is ISO format"""
        response = client.get('/api/health')
        data = json.loads(response.data)
        assert 'Z' in data['timestamp']  # UTC indicator


class TestAnalyzeEndpoint:
    """Test /api/analyze endpoint"""
    
    def test_analyze_with_valid_input(self, client, mock_ai_service):
        """Test analyze endpoint with valid resume text"""
        mock_ai_service.analyze_resume.return_value = (
            {
                'isPerfect': False,
                'suggestions': ['Add more details'],
                'unnecessaryItems': [],
                'summary': 'Good resume'
            },
            None
        )
        
        response = client.post(
            '/api/analyze',
            data=json.dumps({'resumeText': 'Test resume content with enough characters to pass validation'}),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'data' in data
        assert data['data']['isPerfect'] is False
    
    def test_analyze_without_json_content_type(self, client, mock_ai_service):
        """Test analyze endpoint rejects non-JSON content type"""
        response = client.post(
            '/api/analyze',
            data='resumeText=test',
            content_type='application/x-www-form-urlencoded'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'Content-Type' in data['error']
    
    def test_analyze_without_resume_text(self, client, mock_ai_service):
        """Test analyze endpoint with missing resumeText"""
        response = client.post(
            '/api/analyze',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'resumeText' in data['error']
    
    def test_analyze_with_empty_resume_text(self, client, mock_ai_service):
        """Test analyze endpoint with empty resumeText"""
        response = client.post(
            '/api/analyze',
            data=json.dumps({'resumeText': ''}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'empty' in data['error'].lower()
    
    def test_analyze_with_short_resume_text(self, client, mock_ai_service):
        """Test analyze endpoint with resume text too short"""
        response = client.post(
            '/api/analyze',
            data=json.dumps({'resumeText': 'Short'}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'too short' in data['error'].lower()
    
    def test_analyze_with_ai_service_error(self, client, mock_ai_service):
        """Test analyze endpoint when AI service returns error"""
        mock_ai_service.analyze_resume.return_value = (
            None,
            'Analysis failed. Please try again'
        )
        
        response = client.post(
            '/api/analyze',
            data=json.dumps({'resumeText': 'Test resume content with enough characters to pass validation'}),
            content_type='application/json'
        )
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'error' in data
    
    def test_analyze_with_rate_limit_error(self, client, mock_ai_service):
        """Test analyze endpoint with rate limit error"""
        mock_ai_service.analyze_resume.return_value = (
            None,
            'Too many requests. Rate limit exceeded'
        )
        
        response = client.post(
            '/api/analyze',
            data=json.dumps({'resumeText': 'Test resume content with enough characters to pass validation'}),
            content_type='application/json'
        )
        
        assert response.status_code == 429
        data = json.loads(response.data)
        assert data['success'] is False
        assert data['code'] == 'RATE_LIMIT_EXCEEDED'
    
    def test_analyze_without_ai_service(self, client):
        """Test analyze endpoint when AI service is not initialized"""
        with patch('app.ai_service', None):
            response = client.post(
                '/api/analyze',
                data=json.dumps({'resumeText': 'Test resume content with enough characters'}),
                content_type='application/json'
            )
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False
            assert 'AI service not available' in data['error']


class TestGenerateQuestionsEndpoint:
    """Test /api/generate-questions endpoint"""
    
    def test_generate_questions_with_valid_input(self, client, mock_ai_service):
        """Test generate-questions endpoint with valid input"""
        mock_ai_service.generate_questions.return_value = (
            {
                'questions': [
                    {
                        'question': 'What is your experience?',
                        'category': 'experience',
                        'difficulty': 'medium'
                    }
                ]
            },
            None
        )
        
        response = client.post(
            '/api/generate-questions',
            data=json.dumps({'resumeText': 'Test resume content with enough characters to pass validation'}),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'data' in data
        assert len(data['data']['questions']) == 1
    
    def test_generate_questions_with_analysis_context(self, client, mock_ai_service):
        """Test generate-questions endpoint with analysis context"""
        mock_ai_service.generate_questions.return_value = (
            {
                'questions': [
                    {
                        'question': 'Test question',
                        'category': 'technical',
                        'difficulty': 'hard'
                    }
                ]
            },
            None
        )
        
        response = client.post(
            '/api/generate-questions',
            data=json.dumps({
                'resumeText': 'Test resume content with enough characters to pass validation',
                'analysisResult': {
                    'summary': 'Good technical background'
                }
            }),
            content_type='application/json'
        )
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
    
    def test_generate_questions_without_json_content_type(self, client, mock_ai_service):
        """Test generate-questions endpoint rejects non-JSON"""
        response = client.post(
            '/api/generate-questions',
            data='resumeText=test',
            content_type='application/x-www-form-urlencoded'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_generate_questions_without_resume_text(self, client, mock_ai_service):
        """Test generate-questions endpoint with missing resumeText"""
        response = client.post(
            '/api/generate-questions',
            data=json.dumps({}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'resumeText' in data['error']
    
    def test_generate_questions_with_empty_resume_text(self, client, mock_ai_service):
        """Test generate-questions endpoint with empty resumeText"""
        response = client.post(
            '/api/generate-questions',
            data=json.dumps({'resumeText': ''}),
            content_type='application/json'
        )
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_generate_questions_with_ai_service_error(self, client, mock_ai_service):
        """Test generate-questions endpoint when AI service returns error"""
        mock_ai_service.generate_questions.return_value = (
            None,
            'Question generation failed'
        )
        
        response = client.post(
            '/api/generate-questions',
            data=json.dumps({'resumeText': 'Test resume content with enough characters to pass validation'}),
            content_type='application/json'
        )
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert data['success'] is False
    
    def test_generate_questions_without_ai_service(self, client):
        """Test generate-questions endpoint when AI service not initialized"""
        with patch('app.ai_service', None):
            response = client.post(
                '/api/generate-questions',
                data=json.dumps({'resumeText': 'Test resume content with enough characters'}),
                content_type='application/json'
            )
            
            assert response.status_code == 500
            data = json.loads(response.data)
            assert data['success'] is False


class TestErrorHandlers:
    """Test error handler endpoints"""
    
    def test_404_not_found(self, client):
        """Test 404 error handler"""
        response = client.get('/api/nonexistent')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['success'] is False
        assert data['code'] == 'NOT_FOUND'
    
    def test_405_method_not_allowed(self, client):
        """Test 405 error handler"""
        response = client.get('/api/analyze')  # Should be POST
        assert response.status_code == 405
        data = json.loads(response.data)
        assert data['success'] is False
        assert data['code'] == 'METHOD_NOT_ALLOWED'
    
    def test_error_response_format(self, client):
        """Test error responses have consistent format"""
        response = client.get('/api/nonexistent')
        data = json.loads(response.data)
        assert 'success' in data
        assert 'error' in data
        assert 'code' in data
        assert 'timestamp' in data
        assert data['success'] is False
