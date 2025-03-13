import React, { useState } from "react";
import Navbar from "../landing/Navbar";
import Footer from "../landing/Footer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Check, Upload, FileText } from "lucide-react";
import { Separator } from "../ui/separator";

const QuotePage = () => {
  const [translationType, setTranslationType] = useState("certified");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [file, setFile] = useState<File | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <div className="w-full max-w-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      1
                    </div>
                    <div className="ml-2 font-medium text-gray-900">
                      Contact
                    </div>
                  </div>
                  <div className="h-1 w-16 bg-gray-200"></div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      2
                    </div>
                    <div className="ml-2 font-medium text-gray-900">
                      Details
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">
                  What type of translation do you need?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={translationType}
                  onValueChange={setTranslationType}
                  className="space-y-4"
                >
                  <div
                    className={`border rounded-md p-4 ${translationType === "certified" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
                  >
                    <div className="flex items-start">
                      <RadioGroupItem
                        value="certified"
                        id="certified"
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <Label
                          htmlFor="certified"
                          className="text-base font-medium"
                        >
                          Certified Translation
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Word-for-word document translation with a certificate
                          of translation accuracy for official use.
                        </p>
                      </div>
                      {translationType === "certified" && (
                        <div className="ml-auto">
                          <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Selected
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`border rounded-md p-4 ${translationType === "standard" ? "border-blue-600 bg-blue-50" : "border-gray-200"}`}
                  >
                    <div className="flex items-start">
                      <RadioGroupItem
                        value="standard"
                        id="standard"
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <Label
                          htmlFor="standard"
                          className="text-base font-medium"
                        >
                          Standard Translation
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          Informative document or written content translation
                          for business, personal, or professional use.
                        </p>
                      </div>
                      {translationType === "standard" && (
                        <div className="ml-auto">
                          <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Selected
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    What language pair do you need translated?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="source-language" className="mb-2 block">
                        Translate From
                      </Label>
                      <Select
                        value={sourceLanguage}
                        onValueChange={setSourceLanguage}
                      >
                        <SelectTrigger id="source-language">
                          <SelectValue placeholder="Select language" />
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
                    </div>

                    <div>
                      <Label htmlFor="target-language" className="mb-2 block">
                        Translate To
                      </Label>
                      <Select
                        value={targetLanguage}
                        onValueChange={setTargetLanguage}
                      >
                        <SelectTrigger id="target-language">
                          <SelectValue placeholder="Select language" />
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
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Upload the files you need translated
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Upload className="h-10 w-10 text-gray-400" />
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-gray-700">
                          Drag and drop or choose files to upload to your quote
                        </p>
                        <p className="text-xs text-gray-500">
                          Supported formats: PDF, DOCX, JPG, PNG (Max 10MB)
                        </p>
                      </div>
                      <Input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.docx,.jpg,.jpeg,.png"
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById("file-upload")?.click()
                        }
                      >
                        Choose Files
                      </Button>
                    </div>
                  </div>

                  {file && (
                    <div className="mt-4 flex items-center justify-between p-3 border rounded-md bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
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
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Which optional services do you need?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border rounded-md p-4">
                      <div className="flex items-start">
                        <div className="ml-3">
                          <p className="text-base font-medium">Notarization</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Stamp and signature authenticating the signer of the
                            translation certification. Valid in all 50 states.
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Add
                      </Button>
                    </div>

                    <div className="flex items-center justify-between border rounded-md p-4">
                      <div className="flex items-start">
                        <div className="ml-3">
                          <p className="text-base font-medium">
                            Expedited Turnaround
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Our order will be prioritized and turnaround time
                            for digital delivery reduced by 50%.
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Add
                      </Button>
                    </div>

                    <div className="flex items-center justify-between border rounded-md p-4">
                      <div className="flex items-start">
                        <div className="ml-3">
                          <p className="text-base font-medium">
                            Mail Hard Copy
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Original translation with wet ink signature shipped
                            worldwide with tracking.
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-medium mb-4">Notes</h3>
                  <Textarea
                    placeholder="Please include any notes your translation team might need including the preferred spelling for all people and places."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="pt-6">
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-medium text-lg mb-2">What to expect</h3>
                    <p className="text-gray-600 mb-4">
                      We'll respond quickly with a formal quote covering the
                      cost and turnaround time for your translation project.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">
                          Free quote, no obligation to buy
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">
                          Final pricing with no surprises
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">
                          Estimated turnaround time
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">
                          Quick convert to order when ready
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">
                          Quote is guaranteed for 30 days
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full" size="lg">
                    Submit Quote Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default QuotePage;
