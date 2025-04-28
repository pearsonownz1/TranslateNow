import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Award,
  Users,
  FileText,
  Lock,
  Languages, // Added for translation feature
} from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="mb-4 bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </CardContent>
  </Card>
);

const Features = () => {
  // Combined features for Evaluation & Academic Translation
  const features = [
    {
      icon: <Award className="h-6 w-6" />,
      title: "Widely Accepted Reports",
      description:
        "Credential evaluations and certified translations accepted by USCIS, universities, employers, and licensing boards.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Fast & Reliable Turnaround",
      description:
        "Choose from standard or rush processing options for both evaluations and translations to meet your deadlines.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Evaluators & Translators",
      description:
        "Experienced professionals ensure accurate U.S. equivalency assessments and certified academic translations.",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Comprehensive Services",
      description:
        "Offering General, Course-by-Course evaluations and certified translations for diplomas, transcripts, and degrees.",
    },
     {
      icon: <Languages className="h-6 w-6" />, // Added Languages icon
      title: "Certified Translations",
      description:
        "Accurate, certified translations of your academic documents required for evaluation or submission.",
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Secure & Confidential",
      description:
        "We handle your sensitive documents with the utmost confidentiality and security throughout the process.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Trusted Partner for Academic Credentials
          </h2>
          <p className="text-xl text-gray-600">
            Accurate credential evaluations and certified translations for your U.S. academic and professional goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
