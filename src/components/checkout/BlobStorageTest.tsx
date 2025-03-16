import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBlobStorage } from "@/hooks/useBlobStorage";
import { AlertCircle, CheckCircle, Loader2, Upload } from "lucide-react";

const BlobStorageTest = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [testStatus, setTestStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { uploadFile, uploading, error } = useBlobStorage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTestStatus("idle");
      setErrorMessage("");
    }
  };

  const handleTestUpload = async () => {
    if (!file) {
      setErrorMessage("Please select a file first");
      setTestStatus("error");
      return;
    }

    try {
      setTestStatus("uploading");

      // Use a test user ID
      const testUserId = "test-user-" + Date.now();
      const result = await uploadFile(file, "test", testUserId);

      setUploadResult(result);
      setTestStatus("success");
    } catch (err) {
      console.error("Test upload error:", err);
      setTestStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Vercel Blob Storage Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="test-file" className="block text-sm font-medium">
            Select a file to test upload
          </label>
          <input
            id="test-file"
            type="file"
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
          onClick={handleTestUpload}
          disabled={!file || testStatus === "uploading"}
          className="w-full"
        >
          {testStatus === "uploading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Upload...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Test Blob Storage
            </>
          )}
        </Button>

        {testStatus === "success" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">
                Success! Blob storage is working
              </span>
            </div>
            <div className="text-sm space-y-1 mt-2">
              <p>
                <span className="font-medium">File Path:</span>{" "}
                {uploadResult?.filePath}
              </p>
              <p>
                <span className="font-medium">File Name:</span>{" "}
                {uploadResult?.fileName}
              </p>
              <p>
                <span className="font-medium">File Size:</span>{" "}
                {uploadResult?.fileSize} bytes
              </p>
              <p>
                <span className="font-medium">URL:</span> {uploadResult?.url}
              </p>
            </div>
          </div>
        )}

        {testStatus === "error" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error testing Blob storage</span>
            </div>
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlobStorageTest;
