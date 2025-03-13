import React, { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";

// Import checkout components
import CheckoutProgressIndicator from "./checkout/CheckoutProgressIndicator";
import ContactInfoStep from "./checkout/ContactInfoStep";
import DocumentAndLanguageStep from "./checkout/DocumentAndLanguageStep";
import ServiceOptionsStep from "./checkout/ServiceOptionsStep";
import CertificationOptionsStep from "./checkout/CertificationOptionsStep";
import DeliveryOptionsStep from "./checkout/DeliveryOptionsStep";
import PaymentStep from "./checkout/PaymentStep";
import OrderConfirmation from "./checkout/OrderConfirmation";
import OrderSummary from "./checkout/OrderSummary";

function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    contactInfo: {
      fullName: "",
      email: "",
    },
    document: {
      type: "standard",
      file: null,
    },
    languages: {
      source: "en",
      target: "es",
    },
    service: {
      level: "standard",
      price: 49.99,
    },
    certification: {
      type: "standard",
      price: 0,
    },
    delivery: {
      method: "digital",
      price: 0,
    },
  });

  const totalSteps = 5; // Contact, Document+Language, Service, Delivery, Payment

  const steps = [
    { id: 1, name: "Contact" },
    { id: 2, name: "Documents & Languages" },
    { id: 3, name: "Service" },
    { id: 4, name: "Delivery" },
    { id: 5, name: "Payment" },
  ];

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleContactInfoSubmit = (data) => {
    setCheckoutData({
      ...checkoutData,
      contactInfo: data,
    });
    goToNextStep();
  };

  const handleDocumentUpload = (documentType, file) => {
    setCheckoutData({
      ...checkoutData,
      document: {
        type: documentType,
        file: file,
      },
    });
  };

  const handleLanguageSelection = (source, target) => {
    setCheckoutData({
      ...checkoutData,
      languages: {
        source,
        target,
      },
    });
  };

  const handleServiceSelection = (serviceLevel) => {
    const servicePrices = {
      standard: 49.99,
      expedited: 79.99,
      certified: 99.99,
    };

    setCheckoutData({
      ...checkoutData,
      service: {
        level: serviceLevel,
        price: servicePrices[serviceLevel] || 49.99,
      },
    });
  };

  const handleCertificationSelection = (certificationType) => {
    const certificationPrices = {
      standard: 0,
      notarized: 20,
    };

    setCheckoutData({
      ...checkoutData,
      certification: {
        type: certificationType,
        price: certificationPrices[certificationType] || 0,
      },
    });
  };

  const handleDeliverySelection = (deliveryMethod) => {
    const deliveryPrices = {
      digital: 0,
      physical: 20,
      "expedited-physical": 35,
    };

    setCheckoutData({
      ...checkoutData,
      delivery: {
        method: deliveryMethod,
        price: deliveryPrices[deliveryMethod] || 0,
      },
    });
  };

  const handlePaymentComplete = () => {
    setCurrentStep(totalSteps + 1);
    window.scrollTo(0, 0);
  };

  const calculateTotalPrice = () => {
    const basePrice = checkoutData.service.price;
    const certificationPrice = checkoutData.certification.price;
    const deliveryPrice = checkoutData.delivery.price;
    return basePrice + certificationPrice + deliveryPrice;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ContactInfoStep
            onNext={handleContactInfoSubmit}
            defaultValues={checkoutData.contactInfo}
          />
        );
      case 2:
        return (
          <DocumentAndLanguageStep
            onNext={goToNextStep}
            onDocumentTypeChange={(type) =>
              handleDocumentUpload(type, checkoutData.document.file)
            }
            onDocumentUpload={(file) =>
              handleDocumentUpload(checkoutData.document.type, file)
            }
            selectedSourceLanguage={checkoutData.languages.source}
            selectedTargetLanguage={checkoutData.languages.target}
            onSourceLanguageChange={(lang) =>
              handleLanguageSelection(lang, checkoutData.languages.target)
            }
            onTargetLanguageChange={(lang) =>
              handleLanguageSelection(checkoutData.languages.source, lang)
            }
          />
        );
      case 3:
        return (
          <ServiceOptionsStep
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSelectService={handleServiceSelection}
            selectedServiceId={checkoutData.service.level}
            documentType={
              checkoutData.document.type === "standard"
                ? "Standard Document"
                : checkoutData.document.type === "certificate"
                  ? "Certificate"
                  : checkoutData.document.type === "legal"
                    ? "Legal Document"
                    : "Technical Document"
            }
            languagePair={{
              source:
                checkoutData.languages.source === "en"
                  ? "English"
                  : checkoutData.languages.source === "es"
                    ? "Spanish"
                    : checkoutData.languages.source === "fr"
                      ? "French"
                      : "Other",
              target:
                checkoutData.languages.target === "en"
                  ? "English"
                  : checkoutData.languages.target === "es"
                    ? "Spanish"
                    : checkoutData.languages.target === "fr"
                      ? "French"
                      : "Other",
            }}
          />
        );
      case 4:
        return (
          <DeliveryOptionsStep
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onSelectDelivery={handleDeliverySelection}
            selectedDeliveryId={checkoutData.delivery.method}
          />
        );
      case 5:
        return (
          <PaymentStep
            onComplete={handlePaymentComplete}
            onBack={goToPreviousStep}
            orderDetails={{
              documentType:
                checkoutData.document.type === "standard"
                  ? "Standard Document"
                  : checkoutData.document.type === "certificate"
                    ? "Certificate"
                    : checkoutData.document.type === "legal"
                      ? "Legal Document"
                      : "Technical Document",
              sourceLanguage:
                checkoutData.languages.source === "en"
                  ? "English"
                  : checkoutData.languages.source === "es"
                    ? "Spanish"
                    : checkoutData.languages.source === "fr"
                      ? "French"
                      : "Other",
              targetLanguage:
                checkoutData.languages.target === "en"
                  ? "English"
                  : checkoutData.languages.target === "es"
                    ? "Spanish"
                    : checkoutData.languages.target === "fr"
                      ? "French"
                      : "Other",
              serviceLevel:
                checkoutData.service.level === "standard"
                  ? "Standard"
                  : checkoutData.service.level === "expedited"
                    ? "Expedited"
                    : "Certified",
              price: calculateTotalPrice(),
            }}
          />
        );
      default:
        return <ContactInfoStep onNext={handleContactInfoSubmit} />;
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      zh: "Chinese (Simplified)",
      ja: "Japanese",
      ko: "Korean",
      ar: "Arabic",
    };
    return languages[code] || code;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white py-4 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">TranslateNow</h1>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center py-2 px-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center",
                  currentStep === step.id
                    ? "text-gray-900 font-medium"
                    : currentStep > step.id
                      ? "text-gray-700"
                      : "text-gray-400",
                )}
              >
                {currentStep > step.id && (
                  <Check className="h-4 w-4 mr-1 text-gray-700" />
                )}
                {step.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4">
        {currentStep === totalSteps + 1 ? (
          <OrderConfirmation
            orderNumber={`ORD-${Math.floor(Math.random() * 10000000)}`}
            documentType={
              checkoutData.document.type === "standard"
                ? "Standard Document"
                : checkoutData.document.type === "certificate"
                  ? "Certificate"
                  : checkoutData.document.type === "legal"
                    ? "Legal Document"
                    : "Technical Document"
            }
            sourceLanguage={getLanguageName(checkoutData.languages.source)}
            targetLanguage={getLanguageName(checkoutData.languages.target)}
            serviceLevel={
              checkoutData.service.level === "standard"
                ? "Standard"
                : checkoutData.service.level === "expedited"
                  ? "Expedited"
                  : "Certified"
            }
            totalPrice={calculateTotalPrice() * 1.08} // Adding 8% tax
            estimatedDelivery={
              checkoutData.service.level === "expedited"
                ? new Date(
                    Date.now() + 2 * 24 * 60 * 60 * 1000,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date(
                    Date.now() + 5 * 24 * 60 * 60 * 1000,
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
            }
            customerEmail={checkoutData.contactInfo.email}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              {currentStep === 1 && (
                <div className="mb-6">
                  <Button
                    variant="ghost"
                    className="text-gray-500 pl-0"
                    onClick={() => window.history.back()}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </div>
              )}
              {renderStepContent()}
            </div>

            {currentStep > 1 && currentStep <= totalSteps && (
              <div className="w-full lg:w-80 mt-8 lg:mt-0">
                <div className="sticky top-6 space-y-6">
                  <OrderSummary
                    documentType={
                      checkoutData.document.type === "standard"
                        ? "Standard Document"
                        : checkoutData.document.type === "certificate"
                          ? "Certificate"
                          : checkoutData.document.type === "legal"
                            ? "Legal Document"
                            : "Technical Document"
                    }
                    sourceLanguage={getLanguageName(
                      checkoutData.languages.source,
                    )}
                    targetLanguage={getLanguageName(
                      checkoutData.languages.target,
                    )}
                    serviceLevel={
                      checkoutData.service.level === "standard"
                        ? "Standard"
                        : checkoutData.service.level === "expedited"
                          ? "Expedited"
                          : "Certified"
                    }
                    price={calculateTotalPrice()}
                    deliveryTime={
                      checkoutData.service.level === "expedited"
                        ? "1-2 business days"
                        : "3-5 business days"
                    }
                    wordCount={1250}
                  />

                  <div className="text-center">
                    <Button
                      variant="outline"
                      className="w-full text-sm text-gray-500"
                      onClick={() => setCurrentStep(1)}
                    >
                      Cancel and Start Over
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <div>© 2025 TranslateNow, LLC. All Rights Reserved</div>
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
}

export default Home;
