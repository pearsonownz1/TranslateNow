import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import * as pdfjs from "pdfjs-dist";

// We'll set up the worker in a useEffect to ensure it's only done once
// and in the browser environment

export const useDocumentExtraction = () => {
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workerInitialized, setWorkerInitialized] = useState(false);

  // Initialize PDF.js worker
  useEffect(() => {
    const initializeWorker = async () => {
      try {
        // Set worker path directly instead of dynamic import
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
        setWorkerInitialized(true);
      } catch (err) {
        console.error("Failed to initialize PDF.js worker:", err);
        setError(
          "Failed to initialize PDF processing. Please try again later.",
        );
      }
    };

    initializeWorker();
  }, []);

  const extractTextFromDocument = async (file: File): Promise<string> => {
    setExtracting(true);
    setError(null);

    // Check if worker is initialized for PDF files
    if (file.type === "application/pdf" && !workerInitialized) {
      setExtracting(false);
      throw new Error(
        "PDF processing is still initializing. Please try again in a moment.",
      );
    }

    try {
      // For PDF files
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        // Extract text from each page
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(" ");
          fullText += pageText + "\n";
        }

        return fullText || "No text content found in PDF";
      }

      // For DOCX files
      else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        // For DOCX, we'll use the Supabase edge function
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch(
            `${supabase.functions.url}/extract-docx-text`,
            {
              method: "POST",
              body: formData,
              headers: {
                Authorization: `Bearer ${supabase.auth.session()?.access_token || ""}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error(`Failed to extract text: ${response.statusText}`);
          }

          const data = await response.json();
          return data.text || "No text content found in DOCX";
        } catch (docxError) {
          console.error("DOCX extraction error:", docxError);
          return "Unable to extract text from DOCX. Please try a different file format.";
        }
      }

      // For plain text files
      else if (file.type === "text/plain") {
        const text = await file.text();
        return text || "No text content found in text file";
      }

      // For images, we'd use OCR via Supabase edge function
      else if (file.type.startsWith("image/")) {
        // For images, we'll use the Supabase edge function
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await fetch(
            `${supabase.functions.url}/ocr-image-text`,
            {
              method: "POST",
              body: formData,
              headers: {
                Authorization: `Bearer ${supabase.auth.session()?.access_token || ""}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error(`Failed to extract text: ${response.statusText}`);
          }

          const data = await response.json();
          return data.text || "No text content found in image";
        } catch (ocrError) {
          console.error("OCR extraction error:", ocrError);
          return "Unable to extract text from image. Please try a different file format.";
        }
      } else {
        return "Unsupported file format. Please upload a PDF, DOCX, text file, or image.";
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to extract text";
      setError(errorMessage);
      console.error("Document extraction error:", err);
      throw new Error(errorMessage);
    } finally {
      setExtracting(false);
    }
  };

  return {
    extractTextFromDocument,
    extracting,
    error,
  };
};
