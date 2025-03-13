import React, { useState } from "react";
import { Upload, FileText, Check, AlertCircle, Globe } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface DocumentAndLanguageStepProps {
  onNext?: () => void;
  onDocumentTypeChange?: (documentType: string) => void;
  onDocumentUpload?: (file: File) => void;
  onSourceLanguageChange?: (language: string) => void;
  onTargetLanguageChange?: (language: string) => void;
  selectedSourceLanguage?: string;
  selectedTargetLanguage?: string;
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
];

const DocumentAndLanguageStep: React.FC<DocumentAndLanguageStepProps> = ({
  onNext = () => {},
  onDocumentTypeChange = () => {},
  onDocumentUpload = () => {},
  onSourceLanguageChange = () => {},
  onTargetLanguageChange = () => {},
  selectedSourceLanguage = "en",
  selectedTargetLanguage = "es",
}) => {
  const [documentType, setDocumentType] = useState<string>("standard");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [sourceLanguage, setSourceLanguage] = useState(selectedSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(selectedTargetLanguage);
  const [languageError, setLanguageError] = useState<string | null>(null);

  const documentTypes = [
    { id: "standard", name: "Standard Document", price: "$50" },
    { id: "certificate", name: "Certificate", price: "$75" },
    { id: "legal", name: "Legal Document", price: "$100" },
    { id: "medical", name: "Medical Document", price: "$120" },
    { id: "technical", name: "Technical Document", price: "$90" },
  ];

  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value);
    onDocumentTypeChange(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus("idle");
      setErrorMessage("");
    }
  };

  const handleUpload = () => {
    if (!file) {
      setUploadStatus("error");
      setErrorMessage("Please select a file to upload");
      return;
    }

    // Simulate upload process
    setUploadStatus("uploading");

    // Mock successful upload after 1.5 seconds
    setTimeout(() => {
      setUploadStatus("success");
      onDocumentUpload(file);
    }, 1500);
  };

  const handleSourceLanguageChange = (value: string) => {
    setSourceLanguage(value);
    onSourceLanguageChange(value);
    validateLanguagePair(value, targetLanguage);
  };

  const handleTargetLanguageChange = (value: string) => {
    setTargetLanguage(value);
    onTargetLanguageChange(value);
    validateLanguagePair(sourceLanguage, value);
  };

  const validateLanguagePair = (source: string, target: string) => {
    if (source === target) {
      setLanguageError("Source and target languages cannot be the same");
      return false;
    }
    setLanguageError(null);
    return true;
  };

  const handleContinue = () => {
    // Validate document upload
    if (uploadStatus !== "success") {
      setUploadStatus("error");
      setErrorMessage("Please upload a document before continuing");
      return;
    }

    // Validate language pair
    if (!validateLanguagePair(sourceLanguage, targetLanguage)) {
      return;
    }

    onNext();
  };

  const selectedDocumentType = documentTypes.find(
    (doc) => doc.id === documentType,
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-background p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Document Upload & Language Selection
          </CardTitle>
          <CardDescription>
            Upload your document and select the languages for translation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type</Label>
            <Select
              value={documentType}
              onValueChange={handleDocumentTypeChange}
            >
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name} ({doc.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedDocumentType && (
              <p className="text-sm text-muted-foreground mt-2">
                Base price: {selectedDocumentType.price}
              </p>
            )}
          </div>

          {/* Document Upload */}
          <div className="space-y-2">
            <Label htmlFor="document-upload">Upload Document</Label>
            <div className="grid gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-900 transition-colors">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      Drag and drop your file here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, DOCX, JPG, PNG (Max 10MB)
                    </p>
                  </div>
                  <Input
                    id="document-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      document.getElementById("document-upload")?.click()
                    }
                  >
                    Browse Files
                  </Button>
                </div>
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{errorMessage}</p>
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="flex items-center space-x-2 text-gray-900">
                  <Check className="h-4 w-4" />
                  <p className="text-sm">Document uploaded successfully</p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={handleUpload}
                disabled={
                  !file ||
                  uploadStatus === "uploading" ||
                  uploadStatus === "success"
                }
              >
                {uploadStatus === "uploading"
                  ? "Uploading..."
                  : "Upload Document"}
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Language Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5 text-gray-700" />
              <h3 className="font-medium text-gray-900">
                Translation Languages
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label htmlFor="source-language">Source Language</Label>
                <Select
                  value={sourceLanguage}
                  onValueChange={handleSourceLanguageChange}
                >
                  <SelectTrigger id="source-language">
                    <SelectValue placeholder="Select source language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem
                        key={`source-${language.code}`}
                        value={language.code}
                      >
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  The language your document is written in
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="target-language">Target Language</Label>
                <Select
                  value={targetLanguage}
                  onValueChange={handleTargetLanguageChange}
                >
                  <SelectTrigger id="target-language">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem
                        key={`target-${language.code}`}
                        value={language.code}
                      >
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  The language you want your document translated to
                </p>
              </div>
            </div>

            {languageError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
                {languageError}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
          <Button onClick={handleContinue}>Continue to Service Options</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentAndLanguageStep;
