import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PricingTierProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  turnaround: string;
  buttonText: string;
}

const PricingTier = ({
  name,
  price,
  description,
  features,
  isPopular = false,
  turnaround,
  buttonText,
}: PricingTierProps) => (
  <Card
    className={`border ${isPopular ? "border-blue-400 shadow-lg" : "border-gray-200"} h-full flex flex-col`}
  >
    {isPopular && (
      <div className="-mt-5 mb-4 flex justify-center">
        <Badge className="bg-blue-600 text-white hover:bg-blue-700 py-1 px-3 text-xs">
          Most Popular
        </Badge>
      </div>
    )}
    <CardHeader className={isPopular ? "pt-2" : ""}>
      <CardTitle className="text-2xl font-bold">{name}</CardTitle>
      <div className="mt-2">
        <span className="text-3xl font-bold">${price}</span>
        <span className="text-gray-500 ml-1">per page</span>
      </div>
      <p className="text-gray-600 mt-2">{description}</p>
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-500">
          Turnaround Time:
        </div>
        <div className="font-medium">{turnaround}</div>
      </div>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    </CardContent>
    <CardFooter>
      <Button
        asChild
        className={`w-full ${isPopular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
        variant={isPopular ? "default" : "outline"}
      >
        <Link to="/checkout" className="flex items-center justify-center">
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
);

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const pricingTiers = [
    {
      name: "Standard",
      price: 24.99,
      description: "Perfect for non-urgent document translations",
      features: [
        "Certified Translation",
        "Digital Delivery",
        "Certification Statement",
        "Translator's Signature",
        "100% Acceptance Guarantee",
        "Email Support",
      ],
      turnaround: "3-5 Business Days",
      buttonText: "Get Started",
    },
    {
      name: "Expedited",
      price: 39.99,
      description: "Faster translations for time-sensitive needs",
      features: [
        "Certified Translation",
        "Digital Delivery",
        "Certification Statement",
        "Translator's Signature",
        "100% Acceptance Guarantee",
        "Priority Email Support",
        "Rush Processing",
      ],
      isPopular: true,
      turnaround: "1-2 Business Days",
      buttonText: "Choose Expedited",
    },
    {
      name: "Premium",
      price: 59.99,
      description: "Comprehensive solution with additional services",
      features: [
        "Certified Translation",
        "Digital & Physical Delivery",
        "Certification Statement",
        "Translator's Signature",
        "Notarization Available",
        "100% Acceptance Guarantee",
        "24/7 Priority Support",
        "Same-Day Processing",
      ],
      turnaround: "24 Hours",
      buttonText: "Choose Premium",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the service level that fits your needs and timeline
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <PricingTier
              key={index}
              name={tier.name}
              price={tier.price}
              description={tier.description}
              features={tier.features}
              isPopular={tier.isPopular}
              turnaround={tier.turnaround}
              buttonText={tier.buttonText}
            />
          ))}
        </div>

        <div className="mt-16 text-center bg-white p-8 rounded-lg shadow-sm max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Need a Custom Solution?</h3>
          <p className="text-gray-600 mb-6">
            For large projects, specialized documents, or unique language pairs,
            contact us for a custom quote.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link to="/contact">Contact Us for a Custom Quote</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
