import React, { useState } from "react";
import { Upload, FileText, Check, AlertCircle, Globe, Loader2, X } from "lucide-react"; // Added Loader2, X
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
import { Progress } from "@/components/ui/progress"; // Added Progress component

// Define structure for individual file state
export interface UploadedFile { // Added export
  id: string; // Unique ID for React key and state updates
  file: File;
  status: 'queued' | 'uploading' | 'success' | 'error';
  progress?: number; // Optional progress percentage
  error?: string; // Optional error message
  storagePath?: string; // Store path/URL after successful upload
}

// Define the data structure passed by this step (now includes multiple files)
export interface DocumentLanguageData {
  documentType: string;
  files: UploadedFile[]; // Array of uploaded file info (only successful ones passed onNext)
  sourceLanguage: string;
  targetLanguage: string;
}

interface DocumentAndLanguageStepProps {
  onNext?: (data: DocumentLanguageData) => void; // Expect data object
  onBack?: () => void; // Keep onBack if it exists or add if needed
  defaultValues?: Partial<DocumentLanguageData>; // Allow passing default values
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
  onBack = () => window.history.back(), // Default back behavior if not provided
  defaultValues = {},
}) => {
  const [documentType, setDocumentType] = useState<string>(defaultValues.documentType || "standard");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(defaultValues.files || []); // Initialize with defaults if provided
  const [sourceLanguage, setSourceLanguage] = useState(defaultValues.sourceLanguage || "en");
  const [targetLanguage, setTargetLanguage] = useState(defaultValues.targetLanguage || "es");
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
  };

  // Handles selecting multiple files, adds them to state, and triggers upload simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFilesArray = Array.from(e.target.files);
      const newUploads: UploadedFile[] = newFilesArray.map(file => ({
        id: `${file.name}-${file.lastModified}-${file.size}`, // Create a semi-unique ID
        file,
        status: 'queued',
      }));

      setUploadedFiles(prevFiles => {
        const updatedFiles = [...prevFiles, ...newUploads];
        // Trigger upload simulation for each newly added file
        newUploads.forEach(newUpload => {
           // Pass the unique ID for identification
           setTimeout(() => uploadFile(newUpload.id), 0);
        });
        return updatedFiles;
      });
    }
    // Reset the input value to allow selecting the same file again if removed
    e.target.value = '';
  };

   // Function to remove a file from the list
   const handleRemoveFile = (idToRemove: string) => {
     setUploadedFiles(prevFiles => prevFiles.filter(f => f.id !== idToRemove));
     // TODO: If file was already uploaded, potentially delete from storage here
   };

  // Simulates uploading a file identified by its unique ID
  const uploadFile = async (fileId: string) => {
     // Use functional update to safely modify state based on previous state
     // Mark as uploading
     setUploadedFiles(prev => {
        const fileIndex = prev.findIndex(f => f.id === fileId && f.status === 'queued');
        if (fileIndex === -1) return prev;
        console.log(`Starting simulated upload for: ${prev[fileIndex].file.name}`);
        return prev.map((f, index) =>
           index === fileIndex ? { ...f, status: 'uploading', progress: 0, error: undefined } : f
        );
     });

     // Simulate progress
     try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 30 } : f));
        await new Promise(resolve => setTimeout(resolve, 800));
        setUploadedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 75 } : f));
        await new Promise(resolve => setTimeout(resolve, 700));

        // Simulate success/error
        const success = Math.random() > 0.2; // 80% chance of success
        if (success) {
            setUploadedFiles(prev => prev.map(f =>
              f.id === fileId ? { ...f, status: 'success', progress: 100, storagePath: `uploads/${f.file.name}` } : f // Store mock path
            ));
            console.log(`Simulated success for file ID: ${fileId}`);
        } else {
            throw new Error('Simulated upload failed');
        }
     } catch (error: any) {
         console.error(`Simulated error for file ID: ${fileId}`, error);
         setUploadedFiles(prev => prev.map(f =>
           f.id === fileId ? { ...f, status: 'error', error: error.message || 'Upload failed', progress: undefined } : f
         ));
     }
  };

  const handleSourceLanguageChange = (value: string) => {
    setSourceLanguage(value);
    validateLanguagePair(value, targetLanguage);
  };

  const handleTargetLanguageChange = (value: string) => {
    setTargetLanguage(value);
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
    // Validate document uploads: Check if there are any files and if all have status 'success'
    const successfulUploads = uploadedFiles.filter(f => f.status === 'success');

    if (successfulUploads.length === 0) {
       alert("Please upload at least one document successfully.");
       return;
    }
    if (successfulUploads.length !== uploadedFiles.length) {
        alert("Some documents are still uploading or failed to upload. Please remove failed uploads or wait for uploads to complete.");
        return;
    }


    // Validate language pair
    if (!validateLanguagePair(sourceLanguage, targetLanguage)) {
      return;
    }

    // Pass collected data (including the array of successfully uploaded files) to the onNext handler
    onNext({
      documentType,
      files: successfulUploads, // Pass only successfully uploaded files info
      sourceLanguage,
      targetLanguage,
    });
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
            Upload your documents and select the languages for translation
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
            <Label htmlFor="document-upload">Upload Documents</Label>
            <div className="grid gap-4">
              {/* Dropzone Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-900 transition-colors cursor-pointer"
                   onClick={() => document.getElementById("document-upload")?.click()}>
                <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none"> {/* Prevent clicks on inner elements */}
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
                    multiple // Allow multiple file selection
                  />
                   {/* Button removed as the whole area is clickable */}
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
                      {/* Remove Button */}
                      <Button
                           variant="ghost"
                           size="icon"
                           className="h-6 w-6 flex-shrink-0"
                           onClick={() => handleRemoveFile(uploadedFile.id)}
                           disabled={uploadedFile.status === 'uploading'} // Disable remove during upload
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
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleContinue}>Continue to Service Options</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DocumentAndLanguageStep;
