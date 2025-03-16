import React, { useState } from "react";
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Globe,
  Loader2,
  User,
  Lock,
  Mail,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBlobStorage } from "@/hooks/useBlobStorage";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase-client";

interface DocumentAndLanguageStepProps {
  onNext?: (data: {
    documentType: string;
    file: File | null;
    sourceLanguage: string;
    targetLanguage: string;
    documentDetails: any;
    username?: string;
    email?: string;
    password?: string;
  }) => void;
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
  const [documentDetails, setDocumentDetails] = useState<any>(null);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [accountTab, setAccountTab] = useState<string>("guest");
  const [accountError, setAccountError] = useState<string | null>(null);

  const { uploadFile, uploading, error } = useBlobStorage();
  const { user, signUp, signIn } = useAuth();

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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

    // Login check removed to allow document uploads without authentication

    try {
      setUploadStatus("uploading");

      // Check file size
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error("File size exceeds 10MB limit");
      }

      // Upload to Vercel Blob Storage
      const fileDetails = await uploadFile(
        file,
        "documents",
        user?.id || "anonymous",
      );

      if (!fileDetails || !fileDetails.url) {
        throw new Error("File upload failed - no file URL returned");
      }

      try {
        // Store document metadata in the database
        const { data, error } = await supabase
          .from("documents")
          .insert({
            user_id: user?.id || "anonymous",
            document_type: documentType,
            file_path: fileDetails.url,
            file_name: file.name,
            file_size: file.size,
          })
          .select()
          .single();

        if (error) {
          console.error("Database insert error:", error);
          // Create a local document details object even if DB insert fails
          setDocumentDetails({
            id: crypto.randomUUID(),
            user_id: user?.id || "anonymous",
            document_type: documentType,
            file_path: fileDetails.url,
            file_name: file.name,
            file_size: file.size,
            created_at: new Date().toISOString(),
          });
        } else {
          setDocumentDetails(data);
        }
      } catch (dbErr) {
        console.error("Database error:", dbErr);
        // Create a local document details object even if DB insert fails
        setDocumentDetails({
          id: crypto.randomUUID(),
          user_id: user?.id || "anonymous",
          document_type: documentType,
          file_path: fileDetails.url,
          file_name: file.name,
          file_size: file.size,
          created_at: new Date().toISOString(),
        });
      }

      setUploadStatus("success");
      onDocumentUpload(file);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Upload failed");
    }
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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateUserInfo = () => {
    setAccountError(null);

    if (accountTab === "register") {
      if (!username.trim()) {
        setAccountError("Username is required");
        return false;
      }
      if (!email.trim() || !validateEmail(email)) {
        setAccountError("Valid email is required");
        return false;
      }
      if (password.length < 6) {
        setAccountError("Password must be at least 6 characters");
        return false;
      }
    } else if (accountTab === "login") {
      if (!email.trim()) {
        setAccountError("Email is required");
        return false;
      }
      if (!password.trim()) {
        setAccountError("Password is required");
        return false;
      }
    }

    return true;
  };

  const handleContinue = async () => {
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

    // Validate user info if not guest checkout
    if (accountTab !== "guest" && !validateUserInfo()) {
      return;
    }

    // Handle authentication if needed
    try {
      if (accountTab === "register") {
        await signUp(email, password, { username });
      } else if (accountTab === "login") {
        await signIn(email, password);
      }
    } catch (err) {
      console.error("Authentication error:", err);
      setAccountError(
        err instanceof Error ? err.message : "Authentication failed",
      );
      return;
    }

    onNext({
      documentType,
      file,
      sourceLanguage,
      targetLanguage,
      documentDetails,
      username: accountTab !== "guest" ? username : undefined,
      email: accountTab !== "guest" ? email : undefined,
      password: accountTab !== "guest" ? password : undefined,
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
            Document Upload & Account Information
          </CardTitle>
          <CardDescription>
            Upload your document, create an account or continue as guest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-gray-700" />
              <h3 className="font-medium text-gray-900">Account Information</h3>
            </div>

            <Tabs
              defaultValue="guest"
              value={accountTab}
              onValueChange={setAccountTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="guest">Continue as Guest</TabsTrigger>
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="guest" className="pt-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm">
                    You can continue without an account, but creating one will
                    allow you to track your orders and access your translations
                    later.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="login" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-username"
                      placeholder="johndoe"
                      className="pl-10"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {accountError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
                {accountError}
              </div>
            )}
          </div>

          <Separator className="my-6" />
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
