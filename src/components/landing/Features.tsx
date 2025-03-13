import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Clock,
  Award,
  Globe,
  FileCheck,
  CreditCard,
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
  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "100% Acceptance Guarantee",
      description:
        "Our certified translations are accepted by USCIS, universities, and all government agencies worldwide.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Fast Turnaround",
      description:
        "Get your certified translations in as little as 24 hours with our expedited service options.",
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Certified & Notarized",
      description:
        "All translations include certification statements, stamps, and signatures as required by official institutions.",
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "120+ Languages",
      description:
        "Professional translation services available in over 120 languages with native-speaking translators.",
    },
    {
      icon: <FileCheck className="h-6 w-6" />,
      title: "Human Translation",
      description:
        "Every document is translated by professional human translators, not machine translation.",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Transparent Pricing",
      description:
        "Clear, upfront pricing with no hidden fees. Pay only for what you need with our flexible service options.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Our Translation Services
          </h2>
          <p className="text-xl text-gray-600">
            Professional document translation services you can trust for all
            your official needs
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
