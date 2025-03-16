import { useDocumentExtraction } from "@/hooks/useDocumentExtraction";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function ExtractTextPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const { extractTextFromDocument, extracting, error } =
    useDocumentExtraction();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    try {
      const text = await extractTextFromDocument(file);
      setExtractedText(text);
    } catch (err) {
      console.error("Extraction failed:", err);
    }
  };

  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Document Text Extraction
      </h1>
      <p className="text-center mb-8 text-muted-foreground">
        Upload a document to extract its text content. Supported formats: PDF,
        DOCX, plain text, and images.
      </p>

      <Card className="p-6 mb-8 shadow-md">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Upload Document
          </label>
          <input
            type="file"
            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-white
              hover:file:bg-primary/90"
          />
        </div>

        <Button
          onClick={handleExtract}
          disabled={!file || extracting}
          className="w-full"
          size="lg"
        >
          {extracting ? "Extracting..." : "Extract Text"}
        </Button>
      </Card>

      {error && (
        <div className="p-4 mb-8 bg-destructive/10 text-destructive rounded-md">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {extractedText && (
        <Card className="p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Extracted Text</h2>
          <div className="max-h-[500px] overflow-y-auto p-4 bg-muted rounded-md whitespace-pre-wrap border">
            {extractedText}
          </div>
        </Card>
      )}
    </div>
  );
}
