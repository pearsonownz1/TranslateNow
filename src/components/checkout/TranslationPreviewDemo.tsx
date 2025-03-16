import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { useTranslationPreview } from "@/hooks/useTranslationPreview";

const sampleDocuments = [
  {
    id: "legal",
    name: "Legal Contract",
    content: `AGREEMENT OF SALE

This Agreement of Sale ("Agreement") is made and entered into as of the date of the last signature below (the "Effective Date") by and between Seller Corp., a corporation organized under the laws of Delaware ("Seller"), and Buyer Inc., a corporation organized under the laws of California ("Buyer").

WHEREAS, Seller is the owner of certain assets described in Exhibit A attached hereto (the "Assets"); and

WHEREAS, Buyer desires to purchase the Assets from Seller, and Seller desires to sell the Assets to Buyer, upon the terms and conditions set forth in this Agreement.

NOW, THEREFORE, in consideration of the mutual covenants and agreements contained herein, and for other good and valuable consideration, the receipt and sufficiency of which are hereby acknowledged, the parties agree as follows:`,
    sourceLanguage: "en",
  },
  {
    id: "medical",
    name: "Medical Report",
    content: `PATIENT MEDICAL REPORT

Patient Name: John Doe
Date of Birth: 01/15/1975
Medical Record Number: MRN-12345
Date of Examination: 06/10/2023

CHIEF COMPLAINT:
Patient presents with persistent headaches and dizziness for the past two weeks.

HISTORY OF PRESENT ILLNESS:
The patient reports experiencing throbbing headaches, primarily in the frontal and temporal regions, occurring daily for approximately 14 days. The pain is rated as 6-7/10 in severity and is accompanied by intermittent dizziness, especially when standing up quickly. The patient denies nausea, vomiting, or visual disturbances. Symptoms are partially relieved with over-the-counter analgesics.`,
    sourceLanguage: "en",
  },
  {
    id: "technical",
    name: "Technical Manual",
    content: `OPERATING INSTRUCTIONS

Model: XYZ-1000
Serial Number: SN-2023-45678
Manufacturer: Tech Solutions Inc.

1. SAFETY PRECAUTIONS
   1.1 Always disconnect the power supply before performing any maintenance.
   1.2 Wear appropriate protective equipment when operating this device.
   1.3 Do not expose the unit to moisture or extreme temperatures.

2. INSTALLATION
   2.1 Unpack the device and verify all components are included.
   2.2 Place the unit on a stable, level surface with adequate ventilation.
   2.3 Connect the power cable to a grounded outlet.`,
    sourceLanguage: "en",
  },
];

const targetLanguageOptions = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "ja", name: "Japanese" },
];

const TranslationPreviewDemo: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState(sampleDocuments[0]);
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [translationPreview, setTranslationPreview] = useState<string>("");
  const [activeTab, setActiveTab] = useState("original");

  const { getTranslationPreview, translating } = useTranslationPreview();

  const handleDocumentChange = (docId: string) => {
    const doc = sampleDocuments.find((d) => d.id === docId);
    if (doc) {
      setSelectedDocument(doc);
      setTranslationPreview("");
      setActiveTab("original");
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setTargetLanguage(langCode);
    setTranslationPreview("");
  };

  const generateTranslationPreview = async () => {
    try {
      const preview = await getTranslationPreview(
        selectedDocument.content,
        "English", // Source language name
        targetLanguageOptions.find((l) => l.code === targetLanguage)?.name ||
          "Spanish",
      );

      setTranslationPreview(preview);
      setActiveTab("preview");
    } catch (err) {
      console.error("Translation preview error:", err);
    }
  };

  // Auto-generate translation when document or language changes
  useEffect(() => {
    if (selectedDocument && targetLanguage && !translating) {
      generateTranslationPreview();
    }
  }, [selectedDocument.id, targetLanguage]);

  const getTargetLanguageName = (code: string) => {
    return (
      targetLanguageOptions.find((l) => l.code === code)?.name || "Unknown"
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-background p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            OpenAI Translation Preview Demo
          </CardTitle>
          <CardDescription>
            See how our AI-powered translation works with sample documents
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Document Selection */}
          <div className="flex flex-wrap gap-3">
            {sampleDocuments.map((doc) => (
              <Button
                key={doc.id}
                variant={selectedDocument.id === doc.id ? "default" : "outline"}
                onClick={() => handleDocumentChange(doc.id)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {doc.name}
              </Button>
            ))}
          </div>

          {/* Language Selection */}
          <div className="flex flex-wrap gap-3">
            {targetLanguageOptions.map((lang) => (
              <Button
                key={lang.code}
                variant={targetLanguage === lang.code ? "default" : "outline"}
                onClick={() => handleLanguageChange(lang.code)}
                size="sm"
              >
                {lang.name}
              </Button>
            ))}
          </div>

          {/* Translation Preview */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">
                Translating: {selectedDocument.name} →{" "}
                {getTargetLanguageName(targetLanguage)}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={generateTranslationPreview}
                disabled={translating}
              >
                {translating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>Refresh Translation</>
                )}
              </Button>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">Original Text</TabsTrigger>
                <TabsTrigger value="preview">Translation Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="original" className="mt-2">
                <Textarea
                  value={selectedDocument.content}
                  readOnly
                  className="min-h-[300px] resize-none bg-muted/30 font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-2">
                <div className="relative">
                  <Textarea
                    value={translationPreview}
                    readOnly
                    className="min-h-[300px] resize-none bg-muted/30 font-mono text-sm"
                    placeholder="Translation preview will appear here..."
                  />
                  {translating && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">
                        Generating translation preview...
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700">
                  <p className="text-sm">
                    <span className="font-medium">Note:</span> This is an
                    AI-generated preview of how your document might be
                    translated. The final translation will be more accurate and
                    professionally reviewed by our expert translators.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Powered by OpenAI's advanced language models
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TranslationPreviewDemo;
