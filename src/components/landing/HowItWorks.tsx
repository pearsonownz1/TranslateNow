import React from "react";
import { FileUp, Languages, Clock, CreditCard, FileCheck } from "lucide-react";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step = ({ number, title, description, icon }: StepProps) => (
  <div className="flex items-start">
    <div className="flex-shrink-0 mr-6">
      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
        {number}
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center mb-2">
        <div className="mr-2 text-blue-600">{icon}</div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Upload Your Documents",
      description:
        "Simply upload the documents you need translated through our secure platform.",
      icon: <FileUp className="h-5 w-5" />,
    },
    {
      number: 2,
      title: "Select Languages",
      description:
        "Choose the source language of your document and the target language for translation.",
      icon: <Languages className="h-5 w-5" />,
    },
    {
      number: 3,
      title: "Choose Service Level",
      description:
        "Select from standard, expedited, or certified translation services based on your needs.",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      number: 4,
      title: "Secure Payment",
      description:
        "Complete your order with our secure payment system. We accept all major credit cards.",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      number: 5,
      title: "Receive Translations",
      description:
        "Get your professionally translated and certified documents delivered to you.",
      icon: <FileCheck className="h-5 w-5" />,
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">
            Get your certified translations in just a few simple steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical line connecting steps */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-blue-200 hidden md:block"></div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <Step
                  key={index}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
