import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Award, FileCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CertificationOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
}

interface CertificationOptionsStepProps {
  onNext?: () => void;
  onBack?: () => void;
  onSelectCertification?: (certificationId: string) => void;
  selectedCertificationId?: string;
  documentType?: string;
}

const CertificationOptionsStep = ({
  onNext = () => {},
  onBack = () => {},
  onSelectCertification = () => {},
  selectedCertificationId = "standard",
  documentType = "Standard Document",
}: CertificationOptionsStepProps) => {
  const [selectedCertification, setSelectedCertification] = useState<string>(
    selectedCertificationId,
  );

  const certificationOptions: CertificationOption[] = [
    {
      id: "standard",
      name: "Certified",
      description:
        "Includes a Certification of Translation Accuracy, stamp, and signature",
      price: 0,
      icon: <FileCheck className="h-6 w-6 text-gray-700" />,
    },
    {
      id: "notarized",
      name: "Certified & Notarized",
      description:
        "Includes certification plus notary stamp and signature for legal purposes",
      price: 20,
      icon: <Award className="h-6 w-6 text-gray-700" />,
    },
  ];

  const handleCertificationChange = (value: string) => {
    setSelectedCertification(value);
    onSelectCertification(value);
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Certification Options
        </h2>
        <p className="text-gray-600">
          Select the type of certification required for your {documentType}
        </p>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Not sure which certification is required?</AlertTitle>
        <AlertDescription>
          <a href="#" className="text-gray-900 hover:underline">
            View our certification guide
          </a>{" "}
          or contact our support team for assistance.
        </AlertDescription>
      </Alert>

      <RadioGroup
        value={selectedCertification}
        onValueChange={handleCertificationChange}
        className="space-y-4"
      >
        {certificationOptions.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "cursor-pointer border-2",
              selectedCertification === option.id
                ? "border-gray-900"
                : "border-gray-200",
            )}
            onClick={() => handleCertificationChange(option.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-gray-100">
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{option.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {option.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-900">
                        {option.price === 0
                          ? "Included"
                          : `+$${option.price.toFixed(2)}`}
                      </span>
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="h-5 w-5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  );
};

export default CertificationOptionsStep;
