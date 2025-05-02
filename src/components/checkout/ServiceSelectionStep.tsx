import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ServiceType } from './CheckoutFlow'; // Import the type

interface ServiceSelectionStepProps {
  onNext: (serviceType: ServiceType) => void;
  onBack?: () => void; // Optional back navigation
  defaultService?: ServiceType;
}

const serviceOptions = [
  { id: 'credential-evaluation', name: 'Credential Evaluation', description: 'Evaluate your foreign academic credentials.' },
  { id: 'certified-translation', name: 'Certified Translation', description: 'Translate your documents for official use.' },
];

const ServiceSelectionStep: React.FC<ServiceSelectionStepProps> = ({ onNext, onBack, defaultService }) => {
  const [selectedService, setSelectedService] = useState<ServiceType>(defaultService || null);

  const handleNext = () => {
    if (selectedService) {
      onNext(selectedService);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Select Your Service</CardTitle>
          <CardDescription>Choose the service you need to get started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={selectedService ?? ""} onValueChange={(value) => setSelectedService(value as ServiceType)}>
            {serviceOptions.map((option) => (
              <Card key={option.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                 <Label htmlFor={option.id} className="flex items-center space-x-3 cursor-pointer">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <div className="flex-1">
                      <span className="font-medium block">{option.name}</span>
                      <span className="text-sm text-muted-foreground">{option.description}</span>
                    </div>
                 </Label>
              </Card>
            ))}
          </RadioGroup>
          <div className={`flex ${onBack ? 'justify-between' : 'justify-end'} pt-4`}>
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={!selectedService}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceSelectionStep;
