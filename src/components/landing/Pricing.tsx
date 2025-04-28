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
  price: string; // Changed to string to accommodate "Starts at"
  priceUnit: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  turnaround: string;
  buttonText: string;
  linkTo: string;
}

const PricingTier = ({
  name,
  price,
  priceUnit,
  description,
  features,
  isPopular = false,
  turnaround,
  buttonText,
  linkTo,
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
        {/* Display price string directly */}
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-gray-500 ml-1">{priceUnit}</span>
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
        <Link to={linkTo} className="flex items-center justify-center">
          {buttonText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
);

const Pricing = () => {
  // Combined pricing for Evaluation & Academic Translation
  const pricingTiers = [
     {
      name: "Credential Evaluation",
      price: "$99+", // Use string for "Starts at"
      priceUnit: "per report",
      description: "General or Course-by-Course U.S. equivalency reports.",
      features: [
        "Accepted by USCIS, Universities, Employers",
        "General or Course-by-Course options",
        "Digital Report Delivery",
        "Standard & Rush Turnaround Available",
      ],
      isPopular: true, // Make evaluation popular
      turnaround: "5-10 Business Days (Standard)",
      buttonText: "Start Evaluation",
      linkTo: "/checkout?service=evaluation",
    },
    {
      name: "Certified Academic Translation",
      price: "$24.99", // Use string
      priceUnit: "per page",
      description: "Certified translation of diplomas, transcripts, etc.",
      features: [
        "USCIS Accepted Translations",
        "120+ Languages Supported",
        "Digital Delivery Included",
        "Notarization Available",
        "Standard & Rush Turnaround",
      ],
      turnaround: "1-3 Business Days (Standard)",
      buttonText: "Order Translation",
      linkTo: "/checkout?service=translation",
    },
    {
      name: "Evaluation + Translation Bundle",
      price: "$199+", // Example bundle price
      priceUnit: "per credential",
      description: "Get both evaluation and translation for one credential.",
      features: [
        "Includes Course-by-Course Evaluation",
        "Includes Certified Translation (up to X pages)", // Specify page limit if applicable
        "Streamlined Process",
        "Digital Delivery of Both Reports",
        "Standard Processing",
      ],
      turnaround: "7-12 Business Days",
      buttonText: "Order Bundle",
      linkTo: "/checkout?service=bundle", // Example link for bundle
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Evaluation & Translation Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Clear pricing for your academic credential needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <PricingTier
              key={index}
              name={tier.name}
              price={tier.price}
              priceUnit={tier.priceUnit}
              description={tier.description}
              features={tier.features}
              isPopular={tier.isPopular}
              turnaround={tier.turnaround}
              buttonText={tier.buttonText}
              linkTo={tier.linkTo}
            />
          ))}
        </div>

        <div className="mt-16 text-center bg-white p-8 rounded-lg shadow-sm max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Need Assistance?</h3>
          <p className="text-gray-600 mb-6">
            Unsure which service you need? Contact our experts for guidance.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
