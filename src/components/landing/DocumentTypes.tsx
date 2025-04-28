import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Briefcase,
  FileSignature,
  ArrowRight,
  Languages, // Added for translation card
} from "lucide-react";

interface DocumentTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  examples: string[];
  linkTo: string;
  buttonText?: string; // Optional button text
}

const DocumentTypeCard = ({
  icon,
  title,
  description,
  examples,
  linkTo,
  buttonText = "Learn More", // Default button text
}: DocumentTypeCardProps) => (
  <Card className="border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
    <CardContent className="p-6 flex flex-col h-full">
      <div className="mb-4 text-blue-600">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-500 mb-2">Examples:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          {examples.map((example, index) => (
            <li key={index} className="flex items-center">
              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
              {example}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto pt-4">
        <Button asChild variant="outline" className="w-full">
          <Link to={linkTo} className="flex items-center justify-center">
            {buttonText} {/* Use dynamic button text */}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const DocumentTypes = () => {
  // Combined document types for Evaluation & Academic Translation
  const documentTypes = [
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Credential Evaluation Documents",
      description:
        "Documents required for U.S. academic equivalency reports (General or Course-by-Course).",
      examples: [
        "University Transcripts",
        "Degree Certificates / Diplomas",
        "Professional Licenses",
        "Secondary School Records",
      ],
      linkTo: "/checkout?service=evaluation",
      buttonText: "Start Evaluation",
    },
    {
      icon: <Languages className="h-6 w-6" />, // Use Languages icon
      title: "Certified Academic Translations",
      description:
        "Certified translations of foreign academic documents for official U.S. submission.",
      examples: [
        "Diplomas (Any Language)",
        "Transcripts (Any Language)",
        "Degree Certificates",
        "Course Descriptions",
      ],
      linkTo: "/checkout?service=translation", // Link to translation checkout
      buttonText: "Order Translation",
    },
    {
      icon: <FileSignature className="h-6 w-6" />,
      title: "Other Official Documents",
      description:
        "We also provide certified translations for other official documents needed alongside academic records.",
       examples: [
        "Birth Certificates",
        "Marriage Certificates",
        "Passports & Visas",
        "Legal Contracts", // Example
      ],
      linkTo: "/checkout?service=translation", // Link to general translation
      buttonText: "Order Translation",
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Documents We Evaluate & Translate
          </h2>
          <p className="text-xl text-gray-600">
            Comprehensive services for your foreign academic and official documents.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {documentTypes.map((docType, index) => (
            <DocumentTypeCard
              key={index}
              icon={docType.icon}
              title={docType.title}
              description={docType.description}
              examples={docType.examples}
              linkTo={docType.linkTo}
              buttonText={docType.buttonText} // Pass button text
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentTypes;
