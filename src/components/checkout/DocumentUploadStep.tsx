import React, { useState } from "react";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
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

interface DocumentUploadStepProps {
  onNext?: () => void;
  onDocumentTypeChange?: (documentType: string) => void;
  onDocumentUpload?: (file: File) => void;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  onNext = () => {},
  onDocumentTypeChange = () => {},
  onDocumentUpload = () => {},
}) => {
  const [documentType, setDocumentType] = useState<string>("standard");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

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

  const handleContinue = () => {
    if (uploadStatus === "success") {
      onNext();
    } else {
      setUploadStatus("error");
      setErrorMessage("Please upload a document before continuing");
    }
  };

  const selectedDocumentType = documentTypes.find(
    (doc) => doc.id === documentType,
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-background p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Document Upload</CardTitle>
          <CardDescription>
            Select your document type and upload your file for translation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleUpload}
            disabled={
              !file ||
              uploadStatus === "uploading" ||
              uploadStatus === "success"
            }
          >
            {uploadStatus === "uploading" ? "Uploading..." : "Upload Document"}
          </Button>
          <Button onClick={handleContinue}>
            Continue to Language Selection
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentUploadStep;
