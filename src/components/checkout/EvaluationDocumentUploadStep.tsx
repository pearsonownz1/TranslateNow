import React, { useState } from "react";
import { Upload, FileText, Check, AlertCircle, X } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

// Define structure for individual file state (similar to translation)
// Exporting this type for use in CheckoutFlow
export interface UploadedEvalFile {
  id: string;
  file: File;
  status: 'queued' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
  storagePath?: string; // Store path/URL after successful upload
}

interface EvaluationDocumentUploadStepProps {
  onNext: (files: UploadedEvalFile[]) => void; // Pass array of successful uploads
  onBack: () => void;
  defaultFiles?: UploadedEvalFile[]; // Allow passing default values
}

const EvaluationDocumentUploadStep: React.FC<EvaluationDocumentUploadStepProps> = ({
  onNext,
  onBack,
  defaultFiles = [],
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedEvalFile[]>(defaultFiles);

  // Handles selecting multiple files, adds them to state, and triggers upload simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFilesArray = Array.from(e.target.files);
      const newUploads: UploadedEvalFile[] = newFilesArray.map(file => ({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file,
        status: 'queued',
      }));

      setUploadedFiles(prevFiles => {
        const updatedFiles = [...prevFiles, ...newUploads];
        newUploads.forEach(newUpload => {
           setTimeout(() => uploadFile(newUpload.id), 0); // Simulate async upload
        });
        return updatedFiles;
      });
    }
    e.target.value = ''; // Reset input
  };

   // Function to remove a file
   const handleRemoveFile = (idToRemove: string) => {
     setUploadedFiles(prevFiles => prevFiles.filter(f => f.id !== idToRemove));
   };

  // Simulates uploading a file (always succeeds for now)
  const uploadFile = async (fileId: string) => {
     setUploadedFiles(prev => prev.map(f =>
       f.id === fileId && f.status === 'queued' ? { ...f, status: 'uploading', progress: 0, error: undefined } : f
     ));

     // Simulate progress
     await new Promise(resolve => setTimeout(resolve, 300));
     setUploadedFiles(prev => prev.map(f => f.id === fileId && f.status === 'uploading' ? { ...f, progress: 40 } : f));
     await new Promise(resolve => setTimeout(resolve, 500));
     setUploadedFiles(prev => prev.map(f => f.id === fileId && f.status === 'uploading' ? { ...f, progress: 85 } : f));
     await new Promise(resolve => setTimeout(resolve, 200));

     // Simulate success
     setUploadedFiles(prev => prev.map(f =>
       f.id === fileId && f.status === 'uploading' ? { ...f, status: 'success', progress: 100, storagePath: `eval-uploads/${f.file.name}` } : f
     ));
     console.log(`Simulated success for evaluation file ID: ${fileId}`);
  };


  const handleContinue = () => {
    const successfulUploads = uploadedFiles.filter(f => f.status === 'success');
    if (successfulUploads.length === 0) {
       alert("Please upload at least one document successfully.");
       return;
    }
    if (successfulUploads.length !== uploadedFiles.length) {
        alert("Some documents are still uploading or failed to upload. Please remove failed uploads or wait for uploads to complete.");
        return;
    }
    onNext(successfulUploads); // Pass only successful files
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Evaluation Documents</CardTitle>
          <CardDescription>
            Upload the academic documents you need evaluated (transcripts, diplomas, etc.).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document Upload */}
          <div className="space-y-2">
            <Label htmlFor="document-upload">Upload Documents</Label>
            <div className="grid gap-4">
              {/* Dropzone Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-900 transition-colors cursor-pointer"
                   onClick={() => document.getElementById("document-upload")?.click()}>
                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      Drag and drop files here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, DOCX, JPG, PNG (Max 10MB each)
                    </p>
                  </div>
                  <Input
                    id="document-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    multiple
                  />
                </div>
              </div>

              {/* Display list of uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                  {uploadedFiles.map((uploadedFile) => (
                    <div key={uploadedFile.id} className="flex items-center justify-between p-3 border rounded-md bg-muted/50 gap-2">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" title={uploadedFile.file.name}>{uploadedFile.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {uploadedFile.status === 'uploading' && uploadedFile.progress !== undefined && (
                             <Progress value={uploadedFile.progress} className="h-1 mt-1" />
                          )}
                          {uploadedFile.status === 'success' && (
                             <span className="text-xs text-green-600 flex items-center"><Check className="h-3 w-3 mr-1"/>Uploaded</span>
                          )}
                          {uploadedFile.status === 'error' && (
                             <p className="text-xs text-destructive flex items-center" title={uploadedFile.error}>
                               <AlertCircle className="h-3 w-3 mr-1"/> Error: {uploadedFile.error?.substring(0, 30) || 'Upload failed'}...
                             </p>
                          )}
                           {uploadedFile.status === 'queued' && (
                             <span className="text-xs text-gray-500">Queued for upload...</span>
                          )}
                        </div>
                      </div>
                      <Button
                           variant="ghost"
                           size="icon"
                           className="h-6 w-6 flex-shrink-0"
                           onClick={() => handleRemoveFile(uploadedFile.id)}
                           disabled={uploadedFile.status === 'uploading'}
                         >
                           <X className="h-4 w-4" />
                           <span className="sr-only">Remove file</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
         <CardFooter className="flex justify-between">
           <Button variant="outline" onClick={onBack}>
             Back
           </Button>
           <Button onClick={handleContinue}>
             Continue to Payment
           </Button>
         </CardFooter>
      </Card>
    </div>
  );
};

export default EvaluationDocumentUploadStep;
