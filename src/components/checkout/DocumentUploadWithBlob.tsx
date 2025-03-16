import { useState, useContext } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useBlobStorage } from "../../hooks/useBlobStorage";
import { AuthContext } from "../../context/AuthContext";
import { AlertCircle, Upload, FileText, CheckCircle2 } from "lucide-react";

interface DocumentUploadProps {
  onDocumentUploaded: (documentInfo: {
    filePath: string;
    fileName: string;
    fileSize: number;
    documentType: string;
    url: string;
  }) => void;
}

export default function DocumentUploadWithBlob({
  onDocumentUploaded,
}: DocumentUploadProps) {
  const [documentType, setDocumentType] = useState("standard");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const { uploadFile, uploading, error } = useBlobStorage();
  const { user } = useContext(AuthContext);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus("idle");
      setErrorMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file || !user?.id) {
      setErrorMessage("Please select a file and ensure you're logged in");
      setUploadStatus("error");
      return;
    }

    try {
      setUploadStatus("uploading");

      // Upload to Vercel Blob
      const result = await uploadFile(file, documentType, user.id);

      setUploadStatus("success");

      // Pass the document info to parent component
      onDocumentUploaded({
        ...result,
        documentType,
      });
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to upload document",
      );
    }
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader>
        <CardTitle>Upload Your Document</CardTitle>
        <CardDescription>
          Select your document type and upload the file you need translated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type</Label>
          <Select
            value={documentType}
            onValueChange={(value) => setDocumentType(value)}
          >
            <SelectTrigger id="document-type">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Document</SelectItem>
              <SelectItem value="certificate">Certificate</SelectItem>
              <SelectItem value="legal">Legal Document</SelectItem>
              <SelectItem value="medical">Medical Document</SelectItem>
              <SelectItem value="technical">Technical Document</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-file">Upload Document</Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-500 transition-colors cursor-pointer">
                <input
                  id="document-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="document-file"
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                >
                  {!file ? (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Word, Text, or Image files (max 10MB)
                      </p>
                    </>
                  ) : (
                    <>
                      <FileText className="h-10 w-10 text-blue-500 mb-2" />
                      <p className="text-sm text-gray-800 font-medium truncate max-w-full">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
            <Button
              onClick={handleUpload}
              disabled={
                !file ||
                uploadStatus === "uploading" ||
                uploadStatus === "success"
              }
              className="min-w-24"
            >
              {uploadStatus === "uploading" ? "Uploading..." : "Upload"}
            </Button>
          </div>

          {uploadStatus === "success" && (
            <div className="flex items-center gap-2 text-green-600 mt-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Document uploaded successfully!</span>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex items-center gap-2 text-red-600 mt-2">
              <AlertCircle className="h-5 w-5" />
              <span>
                {errorMessage || "Failed to upload document. Please try again."}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
