import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface AdminUploadTranslationProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (file: File) => void;
}

const AdminUploadTranslation = ({
  orderId,
  isOpen,
  onClose,
  onUploadComplete,
}: AdminUploadTranslationProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();

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
      toast({
        title: "Translation uploaded successfully",
        description: `File ${file.name} has been uploaded for order ${orderId}`,
      });
      onUploadComplete(file);
      // Close the dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Translated Document</DialogTitle>
          <DialogDescription>
            Upload the completed translation for order {orderId}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-900 transition-colors">
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
                id="translation-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.docx,.jpg,.jpeg,.png"
              />
              <Button
                variant="outline"
                onClick={() =>
                  document.getElementById("translation-upload")?.click()
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
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || uploadStatus === "uploading"}
          >
            {uploadStatus === "uploading"
              ? "Uploading..."
              : "Upload Translation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminUploadTranslation;
