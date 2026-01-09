# Backend Tests

This directory contains comprehensive tests for the AI Resume Analyzer backend.

## Test Structure

- `test_pdf_service.py` - Unit tests for PDF processing and validation
- `test_ai_service.py` - Unit tests for AI service integration and response parsing
- `test_api_endpoints.py` - Integration tests for Flask API endpoints

## Running Tests

### Install Test Dependencies

```bash
pip install -r requirements.txt
```

### Run All Tests

```bash
python -m pytest tests/ -v
```

### Run Specific Test File

```bash
python -m pytest tests/test_pdf_service.py -v
python -m pytest tests/test_ai_service.py -v
python -m pytest tests/test_api_endpoints.py -v
```

### Run Specific Test Class

```bash
python -m pytest tests/test_pdf_service.py::TestPDFValidation -v
```

### Run Specific Test

```bash
python -m pytest tests/test_pdf_service.py::TestPDFValidation::test_validate_pdf_with_no_file -v
```

## Test Coverage

### PDF Service Tests (12 tests)
- File validation (empty files, invalid types, size limits)
- Text extraction from valid and corrupted PDFs
- Error handling for various PDF issues

### AI Service Tests (24 tests)
- Service initialization with/without API keys
- Response parsing for analysis and questions
- Error handling for API failures, rate limits, timeouts
- Mock-based testing to avoid real API calls

### API Endpoint Tests (21 tests)
- Health check endpoint
- Resume analysis endpoint with various inputs
- Question generation endpoint with various inputs
- Error handlers (404, 405, 500)
- Request validation and error responses

## Test Results

All 57 tests pass successfully:
- 12 PDF service tests
- 24 AI service tests  
- 21 API endpoint tests

## Notes

- Tests use mocking to avoid requiring actual Gemini API keys
- PDF tests use minimal valid PDF structures
- API tests use Flask's test client for integration testing
- All tests follow pytest conventions and best practices
