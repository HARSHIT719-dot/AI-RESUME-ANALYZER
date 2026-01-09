"""
PDF Service Module
Handles PDF file processing including text extraction and validation
"""

import io
from typing import Tuple, Optional
from PyPDF2 import PdfReader
from werkzeug.datastructures import FileStorage


class PDFService:
    """Service for handling PDF file operations"""
    
    # Constants
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes
    ALLOWED_MIME_TYPES = ['application/pdf']
    ALLOWED_EXTENSIONS = ['.pdf']
    
    @staticmethod
    def validate_pdf(file: FileStorage) -> Tuple[bool, Optional[str]]:
        """
        Validate PDF file format and size
        
        Args:
            file: FileStorage object from Flask request
            
        Returns:
            Tuple of (is_valid, error_message)
            - (True, None) if valid
            - (False, error_message) if invalid
        """
        # Check if file exists
        if not file:
            return False, "No file provided"
        
        # Check if filename exists
        if not file.filename:
            return False, "No filename provided"
        
        # Check file extension
        if not any(file.filename.lower().endswith(ext) for ext in PDFService.ALLOWED_EXTENSIONS):
            return False, "Please upload a PDF file"
        
        # Check MIME type if available
        if file.content_type and file.content_type not in PDFService.ALLOWED_MIME_TYPES:
            return False, "Please upload a PDF file"
        
        # Check file size by seeking to end
        file.seek(0, 2)  # Seek to end of file
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > PDFService.MAX_FILE_SIZE:
            return False, f"File size must be under {PDFService.MAX_FILE_SIZE // (1024 * 1024)}MB"
        
        if file_size == 0:
            return False, "File is empty"
        
        return True, None
    
    @staticmethod
    def extract_text(file: FileStorage) -> Tuple[Optional[str], Optional[str]]:
        """
        Extract text content from PDF file
        
        Args:
            file: FileStorage object from Flask request
            
        Returns:
            Tuple of (extracted_text, error_message)
            - (text, None) if successful
            - (None, error_message) if failed
        """
        try:
            # First validate the file
            is_valid, error_message = PDFService.validate_pdf(file)
            if not is_valid:
                return None, error_message
            
            # Read file content into memory
            file_content = file.read()
            file.seek(0)  # Reset file pointer for potential reuse
            
            # Create a BytesIO object for PyPDF2
            pdf_file = io.BytesIO(file_content)
            
            # Extract text from PDF
            try:
                pdf_reader = PdfReader(pdf_file)
                
                # Check if PDF is encrypted
                if pdf_reader.is_encrypted:
                    return None, "Cannot process encrypted PDF files"
                
                # Extract text from all pages
                text_content = []
                for page_num, page in enumerate(pdf_reader.pages):
                    try:
                        page_text = page.extract_text()
                        if page_text:
                            text_content.append(page_text)
                    except Exception as page_error:
                        # Log page error but continue with other pages
                        print(f"Warning: Could not extract text from page {page_num + 1}: {str(page_error)}")
                        continue
                
                # Combine all text
                full_text = "\n".join(text_content).strip()
                
                # Check if any text was extracted
                if not full_text:
                    return None, "Unable to read PDF content. The PDF may be image-based or corrupted"
                
                return full_text, None
                
            except Exception as pdf_error:
                # Handle PDF-specific errors
                error_str = str(pdf_error).lower()
                
                if "encrypted" in error_str:
                    return None, "Cannot process encrypted PDF files"
                elif "damaged" in error_str or "corrupt" in error_str:
                    return None, "PDF file appears to be corrupted"
                elif "invalid" in error_str:
                    return None, "Invalid PDF format"
                else:
                    return None, "Unable to read PDF content"
        
        except Exception as e:
            # Handle unexpected errors
            print(f"Unexpected error in extract_text: {str(e)}")
            return None, "An error occurred while processing the PDF"
    
    @staticmethod
    def process_pdf(file: FileStorage) -> Tuple[Optional[str], Optional[str]]:
        """
        Main method to process PDF file - validates and extracts text
        
        Args:
            file: FileStorage object from Flask request
            
        Returns:
            Tuple of (extracted_text, error_message)
            - (text, None) if successful
            - (None, error_message) if failed
        """
        return PDFService.extract_text(file)
