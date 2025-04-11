import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  Award,
  Scale,
  GraduationCap,
  Briefcase,
  FileSignature,
  ArrowRight,
} from "lucide-react";

interface DocumentTypeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  examples: string[];
  linkTo: string; // Add linkTo prop
}

const DocumentTypeCard = ({
  icon,
  title,
  description,
  examples,
  linkTo, // Use linkTo prop
}: DocumentTypeCardProps) => (
  <Card className="border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
    <CardContent className="p-6 flex flex-col h-full"> {/* Ensure content fills height */}
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
      <div className="mt-auto pt-4"> {/* Push button to bottom */}
        <Button asChild variant="outline" className="w-full">
          <Link to={linkTo} className="flex items-center justify-center">
            Learn More {/* Change button text */}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const DocumentTypes = () => {
  const documentTypes = [
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Immigration Documents",
      description:
        "Certified translations for all immigration processes and applications.",
      examples: [
        "Birth Certificates",
        "Marriage Certificates",
        "Divorce Decrees",
        "Passports",
        "ID Cards",
      ],
      linkTo: "/solutions/immigration", // Add link
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Certificates & Records",
      description:
        "Official translations of personal and civil status documents.",
      examples: [
        "Death Certificates",
        "Adoption Papers",
        "Name Change Documents",
        "Police Records",
        "Medical Records",
      ],
      linkTo: "/solutions/personal", // Link to Personal as fallback
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: "Legal Documents",
      description:
        "Precise translations of legal documents with proper terminology.",
      examples: [
        "Court Judgments",
        "Contracts",
        "Powers of Attorney",
        "Affidavits",
        "Legal Notices",
      ],
      linkTo: "/solutions/legal", // Add link
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Academic Documents",
      description:
        "Accurate translations of educational records and credentials.",
      examples: [
        "Diplomas",
        "Transcripts",
        "Degree Certificates",
        "Course Descriptions",
        "Letters of Recommendation",
      ],
      linkTo: "/solutions/academic", // Add link
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Business Documents",
      description:
        "Professional translations for business and corporate needs.",
      examples: [
        "Business Licenses",
        "Financial Statements",
        "Corporate Bylaws",
        "Business Proposals",
        "Annual Reports",
      ],
      linkTo: "/solutions/business", // Add link
    },
    {
      icon: <FileSignature className="h-6 w-6" />,
      title: "Personal Documents",
      description:
        "Certified translations of personal documents for various purposes.",
      examples: [
        "Driver's Licenses",
        "Social Security Cards",
        "Residence Permits",
        "Medical Prescriptions",
        "Personal Letters",
      ],
      linkTo: "/solutions/personal", // Add link
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Document Types We Translate
          </h2>
          <p className="text-xl text-gray-600">
            Professional certified translations for all your official documents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {documentTypes.map((docType, index) => (
            <DocumentTypeCard
              key={index}
              icon={docType.icon}
              title={docType.title}
              description={docType.description}
              examples={docType.examples}
              linkTo={docType.linkTo} // Pass linkTo prop
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DocumentTypes;
