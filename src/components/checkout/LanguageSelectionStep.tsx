import React, { useState } from "react";
import { ArrowRight, Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface LanguageSelectionStepProps {
  onNext?: () => void;
  onPrevious?: () => void;
  selectedSourceLanguage?: string;
  selectedTargetLanguage?: string;
  onSourceLanguageChange?: (language: string) => void;
  onTargetLanguageChange?: (language: string) => void;
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

const LanguageSelectionStep: React.FC<LanguageSelectionStepProps> = ({
  onNext = () => {},
  onPrevious = () => {},
  selectedSourceLanguage = "en",
  selectedTargetLanguage = "es",
  onSourceLanguageChange = () => {},
  onTargetLanguageChange = () => {},
}) => {
  const [sourceLanguage, setSourceLanguage] = useState(selectedSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(selectedTargetLanguage);
  const [error, setError] = useState<string | null>(null);

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
      setError("Source and target languages cannot be the same");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateLanguagePair(sourceLanguage, targetLanguage)) {
      onNext();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Language Selection
        </h2>
        <p className="text-gray-600">
          Select the source language of your document and the target language
          for translation.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-gray-700" />
            <h3 className="font-medium text-gray-700">Source Language</h3>
          </div>
          <Select
            value={sourceLanguage}
            onValueChange={handleSourceLanguageChange}
          >
            <SelectTrigger className="w-full">
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
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-gray-900" />
            <h3 className="font-medium text-gray-700">Target Language</h3>
          </div>
          <Select
            value={targetLanguage}
            onValueChange={handleTargetLanguageChange}
          >
            <SelectTrigger className="w-full">
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

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
        <Button
          variant="outline"
          onClick={onPrevious}
          className="w-full md:w-auto"
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center text-sm text-gray-500">
            <Check className="h-4 w-4 text-gray-700 mr-1" />
            <span>
              {languages.find((l) => l.code === sourceLanguage)?.name ||
                "Source"}
            </span>
            <span className="mx-2">→</span>
            <span>
              {languages.find((l) => l.code === targetLanguage)?.name ||
                "Target"}
            </span>
          </div>
          <Button
            onClick={handleNext}
            className="w-full md:w-auto"
            disabled={!!error}
          >
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionStep;
