import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Clock, Zap, Award } from "lucide-react";

// Define data structure for this step
export interface ServiceOptionsData {
  serviceId: string;
}

interface ServiceOption {
  id: string;
  name: string;
  description: string;
  timeline: string;
  price: number;
  icon: React.ReactNode;
}

interface ServiceOptionsStepProps {
  onNext?: (data: ServiceOptionsData) => void; // Expect data object
  onBack?: () => void;
  // onSelectService?: (serviceId: string) => void; // Remove if passing data via onNext
  defaultValues?: Partial<ServiceOptionsData>; // Use Partial for default values
  // Pass documentType and languagePair for display purposes if needed, but they aren't part of this step's *output* data
  documentType?: string;
  languagePair?: {
    source: string;
    target: string;
  };
}

const ServiceOptionsStep = ({
  onNext = () => {},
  onBack = () => {},
  // onSelectService = () => {}, // Removed from destructuring
  defaultValues = {},
  documentType = "Standard Document", // Keep for display
  languagePair = { source: "English", target: "Spanish" }, // Keep for display
}: ServiceOptionsStepProps) => {
  // Initialize state with defaultValues or fallback
  const [selectedService, setSelectedService] =
    useState<string>(defaultValues.serviceId || "standard");

  const serviceOptions: ServiceOption[] = [
    {
      id: "standard",
      name: "Standard",
      description: "Regular translation service with standard quality checks",
      timeline: "3-5 business days",
      price: 49.99,
      icon: <Clock className="h-6 w-6 text-gray-700" />,
    },
    {
      id: "expedited",
      name: "Expedited",
      description: "Faster translation with priority processing",
      timeline: "1-2 business days",
      price: 79.99,
      icon: <Zap className="h-6 w-6 text-gray-900" />,
    },
    {
      id: "certified",
      name: "Certified",
      description: "Official certified translation for legal documents",
      timeline: "3-5 business days",
      price: 99.99,
      icon: <Award className="h-6 w-6 text-gray-800" />,
    },
  ];

  // No longer calling onSelectService here
  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    // onSelectService(value); // Removed call
  };

  const handleContinue = () => {
    // Pass selected service ID to the onNext handler
    onNext({ serviceId: selectedService });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Service Options</h2>
        <p className="text-gray-600">
          Select the service level that best fits your needs for translating
          your {documentType} from {languagePair.source} to{" "}
          {languagePair.target}.
        </p>
      </div>

      <RadioGroup
        value={selectedService}
        onValueChange={handleServiceChange}
        className="space-y-4"
      >
        {serviceOptions.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer border-2 ${selectedService === service.id ? "border-gray-900" : "border-gray-200"}`}
            onClick={() => handleServiceChange(service.id)}
          >
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 rounded-full bg-gray-100">{service.icon}</div>
              <div>
                <CardTitle className="text-xl">{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </div>
              <div className="ml-auto">
                <RadioGroupItem
                  value={service.id}
                  id={service.id}
                  className="h-5 w-5"
                />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Timeline:</span>{" "}
                  {service.timeline}
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ${service.price.toFixed(2)}
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
        <Button onClick={handleContinue}>Continue to Payment</Button>
      </div>
    </div>
  );
};

export default ServiceOptionsStep;
