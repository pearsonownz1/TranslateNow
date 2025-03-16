import React, { useState, useRef } from "react";
import { PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Upload, Check, AlertCircle, Loader2 } from "lucide-react";

interface ClientUploadComponentProps {
  onUploadComplete?: (result: PutBlobResult) => void;
  allowedFileTypes?: string;
  maxSizeMB?: number;
  userId?: string;
}

const ClientUploadComponent: React.FC<ClientUploadComponentProps> = ({
  onUploadComplete,
  allowedFileTypes = ".pdf,.docx,.jpg,.jpeg,.png",
  maxSizeMB = 10,
  userId = "anonymous",
}) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<PutBlobResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size
      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        setErrorMessage(`File size exceeds ${maxSizeMB}MB limit`);
        setUploadStatus("error");
        return;
      }

      setFile(selectedFile);
      setUploadStatus("idle");
      setErrorMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("error");
      setErrorMessage("Please select a file to upload");
      return;
    }

    try {
      setUploadStatus("uploading");
      setErrorMessage("");

      // Generate a unique filename to prevent collisions
      const fileExt = file.name.split(".").pop();
      const uniqueFileName = `${userId}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

      // Upload directly to Vercel Blob from the client
      const result = await upload(uniqueFileName, file, {
        access: "public",
        handleUploadUrl: "/api/upload-handler",
        // Pass additional metadata if needed
        clientPayload: JSON.stringify({
          userId,
          originalFileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        }),
      });

      setUploadResult(result);
      setUploadStatus("success");

      // Notify parent component if callback provided
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    }
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="text-xl">Upload Document</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-900 transition-colors">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">
                Drag and drop your file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOCX, JPG, PNG (Max {maxSizeMB}MB)
              </p>
            </div>
            <Input
              id="document-upload"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept={allowedFileTypes}
              ref={inputFileRef}
            />
            <Button
              variant="outline"
              onClick={() => inputFileRef.current?.click()}
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
            <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
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
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="h-4 w-4" />
            <p className="text-sm">Document uploaded successfully</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={!file || uploadStatus === "uploading"}
        >
          {uploadStatus === "uploading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Document"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClientUploadComponent;
