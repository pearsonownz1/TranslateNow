import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Truck, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// Define data structure for this step
export interface DeliveryOptionsData {
  deliveryId: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
}

interface DeliveryOptionsStepProps {
  onNext?: (data: DeliveryOptionsData) => void; // Expect data object
  onBack?: () => void;
  // onSelectDelivery?: (deliveryId: string) => void; // Remove if passing data via onNext
  defaultValues?: Partial<DeliveryOptionsData>; // Use Partial for default values
}

const DeliveryOptionsStep = ({
  onNext = () => {},
  onBack = () => {},
  // onSelectDelivery = () => {}, // Removed from destructuring
  defaultValues = {},
}: DeliveryOptionsStepProps) => {
  // Initialize state with defaultValues or fallback
  const [selectedDelivery, setSelectedDelivery] =
    useState<string>(defaultValues.deliveryId || "digital");

  const deliveryOptions: DeliveryOption[] = [
    {
      id: "digital",
      name: "Digital Delivery",
      description:
        "Receive your translated document via email instantly upon completion",
      price: 0,
      icon: <FileText className="h-6 w-6 text-gray-700" />,
    },
    {
      id: "physical",
      name: "Digital & Physical Copy",
      description:
        "Receive digital copy plus a printed version with wet-ink signature via FedEx",
      price: 20,
      icon: <Truck className="h-6 w-6 text-gray-700" />,
    },
    {
      id: "expedited-physical",
      name: "Expedited Physical Delivery",
      description:
        "Receive digital copy plus a printed version with overnight shipping",
      price: 35,
      icon: <Clock className="h-6 w-6 text-gray-700" />,
    },
  ];

  // No longer calling onSelectDelivery here
  const handleDeliveryChange = (value: string) => {
    setSelectedDelivery(value);
    // onSelectDelivery(value); // Removed call
  };

  const handleContinue = () => {
    // Pass selected delivery ID to the onNext handler
    onNext({ deliveryId: selectedDelivery });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Delivery Options</h2>
        <p className="text-gray-600">
          Select how you would like to receive your translated document
        </p>
      </div>

      <RadioGroup
        value={selectedDelivery}
        onValueChange={handleDeliveryChange}
        className="space-y-4"
      >
        {deliveryOptions.map((option) => (
          <Card
            key={option.id}
            className={cn(
              "cursor-pointer border-2",
              selectedDelivery === option.id
                ? "border-gray-900"
                : "border-gray-200",
            )}
            onClick={() => handleDeliveryChange(option.id)}
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
        <Button onClick={handleContinue}>Continue to Payment</Button>
      </div>
    </div>
  );
};

export default DeliveryOptionsStep;
