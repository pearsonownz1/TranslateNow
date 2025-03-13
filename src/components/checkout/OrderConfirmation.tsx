import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Calendar, FileText, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderConfirmationProps {
  orderNumber?: string;
  documentType?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  serviceLevel?: string;
  totalPrice?: number;
  estimatedDelivery?: string;
  customerEmail?: string;
}

const OrderConfirmation = ({
  orderNumber = "ORD-12345678",
  documentType = "Standard Document",
  sourceLanguage = "English",
  targetLanguage = "Spanish",
  serviceLevel = "Expedited",
  totalPrice = 89.99,
  estimatedDelivery = "May 15, 2023",
  customerEmail = "customer@example.com",
}: OrderConfirmationProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-gray-900" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 max-w-md">
          Your translation order has been successfully placed. We've sent a
          confirmation email to {customerEmail}.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Summary
        </h2>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-700">Order Number:</span>
            </div>
            <span className="font-medium">{orderNumber}</span>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-700">Document Type:</span>
            </div>
            <span className="font-medium">{documentType}</span>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center">
              <span className="text-gray-700">Language Pair:</span>
            </div>
            <span className="font-medium">
              {sourceLanguage} → {targetLanguage}
            </span>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-700">Service Level:</span>
            </div>
            <span className="font-medium">{serviceLevel}</span>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-700">Estimated Delivery:</span>
            </div>
            <span className="font-medium">{estimatedDelivery}</span>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          What's Next?
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-gray-900 text-xs font-medium">1</span>
            </div>
            <p className="text-gray-700">
              Our translators will begin working on your document immediately.
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-gray-900 text-xs font-medium">2</span>
            </div>
            <p className="text-gray-700">
              You'll receive email updates about your translation progress.
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <span className="text-gray-900 text-xs font-medium">3</span>
            </div>
            <p className="text-gray-700">
              Once completed, you'll receive a notification to download your
              translated document.
            </p>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button
          variant="default"
          className="flex items-center justify-center gap-2"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Go to Dashboard
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={() => window.print()}
        >
          Print Receipt
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
