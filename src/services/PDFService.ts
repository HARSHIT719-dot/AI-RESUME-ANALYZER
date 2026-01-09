/**
 * PDF Service
 * Handles PDF text extraction using PDF.js
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class PDFService {
  /**
   * Extract text from a PDF file
   * @param file - PDF file to extract text from
   * @returns Extracted text content
   */
  static async extractText(file: File): Promise<string> {
    try {
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      // Extract text from all pages
      const textPromises: Promise<string>[] = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        textPromises.push(
          pdf.getPage(pageNum).then(page => {
            return page.getTextContent().then(textContent => {
              return textContent.items
                .map((item: any) => item.str)
                .join(' ');
            });
          })
        );
      }
      
      const pageTexts = await Promise.all(textPromises);
      const fullText = pageTexts.join('\n\n');
      
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF');
      }
      
      return fullText;
    } catch (error) {
      console.error('PDF text extraction error:', error);
      throw new Error(
        error instanceof Error 
          ? `Failed to extract text from PDF: ${error.message}`
          : 'Failed to extract text from PDF'
      );
    }
  }
}
