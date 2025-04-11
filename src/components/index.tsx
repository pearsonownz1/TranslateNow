import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  ArrowRight,
  FileText,
  Globe,
  CreditCard,
  Truck,
  Check,
} from "lucide-react";

const Index = () => {
  const checkoutSteps = [
    {
      id: "contact",
      title: "Contact Information",
      description:
        "Enter your contact details to begin the translation process",
      icon: <FileText className="h-6 w-6" />,
      path: "/contact",
    },
    {
      id: "document",
      title: "Document Upload",
      description: "Upload your document and select document type",
      icon: <FileText className="h-6 w-6" />,
      path: "/document",
    },
    {
      id: "language",
      title: "Language Selection",
      description: "Choose source and target languages for translation",
      icon: <Globe className="h-6 w-6" />,
      path: "/language",
    },
    {
      id: "service",
      title: "Service Options",
      description: "Select your preferred service level and timeline",
      icon: <Check className="h-6 w-6" />,
      path: "/service",
    },
    {
      id: "delivery",
      title: "Delivery Options",
      description: "Choose how you want to receive your translated document",
      icon: <Truck className="h-6 w-6" />,
      path: "/delivery",
    },
    {
      id: "payment",
      title: "Payment",
      description: "Complete your order with secure payment",
      icon: <CreditCard className="h-6 w-6" />,
      path: "/payment",
    },
    {
      id: "confirmation",
      title: "Order Confirmation",
      description: "Review your completed order details",
      icon: <Check className="h-6 w-6" />,
      path: "/confirmation",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">OpenTranslate</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Document Translation Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional translation services for all your document needs. Fast,
            accurate, and certified translations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {checkoutSteps.map((step) => (
            <Card key={step.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {step.icon}
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {step.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link to="/checkout" className="w-full">
                  <Button className="w-full" variant="outline">
                    View Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to="/checkout">
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800">
              Start Translation Process
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-full">
                <Check className="h-5 w-5 text-gray-900" />
              </div>
              <h3 className="font-semibold text-lg">Certified Translations</h3>
            </div>
            <p className="text-gray-600">
              Our certified translations are accepted by USCIS, universities,
              and government agencies worldwide.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-full">
                <Globe className="h-5 w-5 text-gray-900" />
              </div>
              <h3 className="font-semibold text-lg">50+ Languages</h3>
            </div>
            <p className="text-gray-600">
              We support translations between more than 50 languages with
              native-speaking professional translators.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-full">
                <Truck className="h-5 w-5 text-gray-900" />
              </div>
              <h3 className="font-semibold text-lg">Fast Delivery</h3>
            </div>
            <p className="text-gray-600">
              Get your translations quickly with our expedited service options,
              as fast as 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div>© 2025 OpenTranslate, LLC. All Rights Reserved</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-900">
                Terms of Service
              </a>
              <a href="#" className="hover:text-gray-900">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
