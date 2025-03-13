import React from "react";
import { cn } from "@/lib/utils";

interface CheckoutProgressIndicatorProps {
  currentStep?: number;
  steps?: Array<{
    id: number;
    name: string;
  }>;
}

export default function CheckoutProgressIndicator({
  currentStep = 1,
  steps = [
    { id: 1, name: "Document Upload" },
    { id: 2, name: "Language Selection" },
    { id: 3, name: "Service Options" },
    { id: 4, name: "Payment" },
  ],
}: CheckoutProgressIndicatorProps) {
  return (
    <div className="w-full max-w-[1200px] mx-auto py-6 bg-white">
      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-200">
          <div
            className="h-full bg-gray-800 transition-all duration-300 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Step Indicators */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isActive = step.id <= currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium z-10 transition-all",
                    isActive
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-500",
                    isCurrent && "ring-4 ring-gray-400/20",
                  )}
                >
                  {step.id}
                </div>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium",
                    isActive ? "text-gray-900" : "text-gray-500",
                  )}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
