import React from "react";
// Update icons for evaluation & translation steps
import { FileUp, Languages, ClipboardList, Mail, CheckSquare } from "lucide-react";

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
  // Combined steps for Evaluation & Academic Translation
  const steps = [
    {
      number: 1,
      title: "Submit Documents",
      description:
        "Securely upload your academic documents (transcripts, diplomas) for evaluation and/or translation.",
      icon: <FileUp className="h-5 w-5" />,
    },
    {
      number: 2,
      title: "Select Services",
      description:
        "Choose credential evaluation (General or Course-by-Course) and/or certified translation for required languages.",
      icon: <CheckSquare className="h-5 w-5" />, // Icon for selecting services
    },
    {
      number: 3,
      title: "Expert Processing",
      description:
        "Our qualified evaluators assess U.S. equivalency, and certified translators handle academic document translation.",
      icon: <ClipboardList className="h-5 w-5" />,
    },
     {
      number: 4, // Renumbered
      title: "Receive Your Reports",
      description:
        "Your official evaluation report and/or certified translations are delivered securely.",
      icon: <Mail className="h-5 w-5" />,
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Steps to Success</h2>
          <p className="text-xl text-gray-600">
            Get your credential evaluation and academic translations easily.
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
