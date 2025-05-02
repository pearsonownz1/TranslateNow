import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Define basic types needed by CheckoutFlow
export interface EvaluationData {
  evaluationType?: 'course-by-course' | 'document-by-document';
  processingTime?: 'standard' | 'expedited';
  // Add other fields as needed later
}

interface EvaluationOptionsStepProps {
  onNext: (data: EvaluationData) => void;
  onBack: () => void;
  defaultValues?: Partial<EvaluationData>;
}

const EvaluationOptionsStep: React.FC<EvaluationOptionsStepProps> = ({
  onNext,
  onBack,
  defaultValues = {},
}) => {
  const [evaluationType, setEvaluationType] = useState(defaultValues.evaluationType || 'course-by-course');
  const [processingTime, setProcessingTime] = useState(defaultValues.processingTime || 'standard');

  const handleNext = () => {
    onNext({ evaluationType, processingTime });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Options</CardTitle>
          <CardDescription>Select the type and speed for your credential evaluation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Placeholder for Evaluation Type */}
          <div className='space-y-2'>
            <Label>Evaluation Type</Label>
            <RadioGroup value={evaluationType} onValueChange={(value) => setEvaluationType(value as EvaluationData['evaluationType'])}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="course-by-course" id="cbc" />
                <Label htmlFor="cbc">Course-by-Course ($150)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="document-by-document" id="dbd" />
                <Label htmlFor="dbd">Document-by-Document ($85)</Label>
              </div>
            </RadioGroup>
          </div>

           {/* Placeholder for Processing Time */}
           <div className='space-y-2'>
            <Label>Processing Time</Label>
             <RadioGroup value={processingTime} onValueChange={(value) => setProcessingTime(value as EvaluationData['processingTime'])}>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="standard" id="standard" />
                 <Label htmlFor="standard">Standard (7-10 days)</Label>
               </div>
               <div className="flex items-center space-x-2">
                 <RadioGroupItem value="expedited" id="expedited" />
                 <Label htmlFor="expedited">Expedited (2-3 days, +$50)</Label>
               </div>
             </RadioGroup>
           </div>

          {/* Add more options as needed */}

        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleNext}>
            Continue to Document Upload
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EvaluationOptionsStep;
