"""
Unit tests for PDF Service
Tests text extraction, validation, and error handling
"""

import io
import pytest
from werkzeug.datastructures import FileStorage
from services.pdf_service import PDFService


class TestPDFValidation:
    """Test PDF file validation"""
    
    def test_validate_pdf_with_no_file(self):
        """Test validation with no file provided"""
        is_valid, error = PDFService.validate_pdf(None)
        assert is_valid is False
        assert error == "No file provided"
    
    def test_validate_pdf_with_no_filename(self):
        """Test validation with file but no filename"""
        file = FileStorage(stream=io.BytesIO(b"test"), filename="")
        is_valid, error = PDFService.validate_pdf(file)
        assert is_valid is False
        assert error == "No file provided"
    
    def test_validate_pdf_with_invalid_extension(self):
        """Test validation with non-PDF file extension"""
        file = FileStorage(stream=io.BytesIO(b"test"), filename="test.txt")
        is_valid, error = PDFService.validate_pdf(file)
        assert is_valid is False
        assert error == "Please upload a PDF file"
    
    def test_validate_pdf_with_invalid_mime_type(self):
        """Test validation with invalid MIME type"""
        file = FileStorage(
            stream=io.BytesIO(b"test"),
            filename="test.pdf",
            content_type="text/plain"
        )
        is_valid, error = PDFService.validate_pdf(file)
        assert is_valid is False
        assert error == "Please upload a PDF file"
    
    def test_validate_pdf_with_empty_file(self):
        """Test validation with empty file"""
        file = FileStorage(
            stream=io.BytesIO(b""),
            filename="test.pdf",
            content_type="application/pdf"
        )
        is_valid, error = PDFService.validate_pdf(file)
        assert is_valid is False
        assert error == "File is empty"
    
    def test_validate_pdf_with_file_too_large(self):
        """Test validation with file exceeding size limit"""
        # Create a file larger than 10MB
        large_content = b"x" * (11 * 1024 * 1024)
        file = FileStorage(
            stream=io.BytesIO(large_content),
            filename="test.pdf",
            content_type="application/pdf"
        )
        is_valid, error = PDFService.validate_pdf(file)
        assert is_valid is False
        assert "File size must be under" in error
    
    def test_validate_pdf_with_valid_file(self):
        """Test validation with valid PDF file"""
        # Create a minimal valid PDF
        pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n%%EOF"
        file = FileStorage(
            stream=io.BytesIO(pdf_content),
            filename="test.pdf",
            content_type="application/pdf"
        )
        is_valid, error = PDFService.validate_pdf(file)
        assert is_valid is True
        assert error is None


class TestPDFTextExtraction:
    """Test PDF text extraction"""
    
    def test_extract_text_with_invalid_file(self):
        """Test text extraction with invalid file"""
        file = FileStorage(stream=io.BytesIO(b"test"), filename="test.txt")
        text, error = PDFService.extract_text(file)
        assert text is None
        assert error == "Please upload a PDF file"
    
    def test_extract_text_with_corrupted_pdf(self):
        """Test text extraction with corrupted PDF"""
        # Create invalid PDF content
        corrupted_content = b"Not a real PDF file"
        file = FileStorage(
            stream=io.BytesIO(corrupted_content),
            filename="test.pdf",
            content_type="application/pdf"
        )
        text, error = PDFService.extract_text(file)
        assert text is None
        assert error is not None
        assert "Unable to read PDF content" in error or "Invalid PDF format" in error
    
    def test_extract_text_with_empty_pdf(self):
        """Test text extraction with PDF containing no text"""
        # This is a minimal valid PDF with no text content
        empty_pdf = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
190
%%EOF"""
        file = FileStorage(
            stream=io.BytesIO(empty_pdf),
            filename="test.pdf",
            content_type="application/pdf"
        )
        text, error = PDFService.extract_text(file)
        assert text is None
        assert "Unable to read PDF content" in error


class TestPDFProcessing:
    """Test PDF processing main method"""
    
    def test_process_pdf_with_invalid_file(self):
        """Test process_pdf with invalid file"""
        file = FileStorage(stream=io.BytesIO(b"test"), filename="test.doc")
        text, error = PDFService.process_pdf(file)
        assert text is None
        assert error is not None
    
    def test_process_pdf_delegates_to_extract_text(self):
        """Test that process_pdf delegates to extract_text"""
        file = FileStorage(
            stream=io.BytesIO(b"corrupted"),
            filename="test.pdf",
            content_type="application/pdf"
        )
        result1 = PDFService.process_pdf(file)
        file.seek(0)
        result2 = PDFService.extract_text(file)
        # Both should return similar error results
        assert result1[0] is None
        assert result2[0] is None
