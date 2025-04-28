import React, { useEffect, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Calendar, FileText, Clock, ChevronRight, Loader2, Globe } from "lucide-react"; // Added Globe
import { cn } from "@/lib/utils";
import { OrderData } from "@/App"; // Import OrderData type

// Props are no longer needed as we get data from route state
// interface OrderConfirmationProps {
  // orderNumber?: string;
  // documentType?: string;
  // sourceLanguage?: string; // Removed dangling prop definition
  // targetLanguage?: string;
  // serviceLevel?: string;
  // totalPrice?: number;
  // estimatedDelivery?: string;
  // customerEmail?: string;
// }

// Define pricing structure again (or import from a shared location)
const PRICES = {
  document: { standard: 50, certificate: 75, legal: 100, medical: 120, technical: 90 },
  service: { standard: 0, expedited: 30, certified: 50 },
  delivery: { digital: 0, physical: 20, 'expedited-physical': 35 },
  taxRate: 0.08,
};

const OrderConfirmation = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [orderState, setOrderState] = useState<any>(null); // Use 'any' for state initially

  useEffect(() => {
    if (location.state) {
      setOrderState(location.state);
    }
    setLoading(false);
  }, [location.state]);

  // Calculate total price based on passed orderDetails (similar to PaymentStep)
  const calculateTotal = (data: OrderData | null): { subtotal: number, tax: number, total: number } => {
     if (!data) return { subtotal: 0, tax: 0, total: 0 };
     let subtotal = 0;
     const docType = data.documentLanguage?.documentType as keyof typeof PRICES.document | undefined;
     if (docType && PRICES.document[docType] !== undefined) subtotal += PRICES.document[docType];
     const serviceId = data.serviceOptions?.serviceId as keyof typeof PRICES.service | undefined;
     if (serviceId && PRICES.service[serviceId] !== undefined) subtotal += PRICES.service[serviceId];
     const deliveryId = data.deliveryOptions?.deliveryId as keyof typeof PRICES.delivery | undefined;
     if (deliveryId && PRICES.delivery[deliveryId] !== undefined) subtotal += PRICES.delivery[deliveryId];
     const tax = subtotal * PRICES.taxRate;
     const total = subtotal + tax;
     return { subtotal, tax, total };
  };

  const { total } = calculateTotal(orderState?.orderDetails);

  // Handle loading state or missing state
  if (loading) {
     return <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  if (!orderState?.orderNumber || !orderState?.orderDetails || !orderState?.customerEmail) {
    // If state is missing, redirect to dashboard or home as confirmation isn't possible
    console.warn("Order confirmation page loaded without necessary state. Redirecting.");
    return <Navigate to="/dashboard" replace />;
  }

  // Extract data from state
  const { orderNumber, orderDetails, customerEmail } = orderState;
  const { documentLanguage, serviceOptions } = orderDetails;

  // Example delivery time calculation (adjust as needed)
  const estimatedDelivery = serviceOptions?.serviceId === "expedited" || orderDetails.deliveryOptions?.deliveryId === "expedited-physical"
      ? "1-2 business days"
      : "3-5 business days";


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
          Your translation order <span className="font-medium">#{orderNumber}</span> has been successfully placed. We've sent a
          confirmation email to <span className="font-medium">{customerEmail}</span>.
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
            <span className="font-medium">#{orderNumber}</span>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-700">Document Type:</span>
            </div>
            <span className="font-medium">{documentLanguage?.documentType || 'N/A'}</span>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-gray-500 mr-2" /> {/* Added icon */}
              <span className="text-gray-700">Language Pair:</span>
            </div>
            <span className="font-medium">
              {documentLanguage?.sourceLanguage || 'N/A'} → {documentLanguage?.targetLanguage || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-700">Service Level:</span>
            </div>
            <span className="font-medium">{serviceOptions?.serviceId || 'N/A'}</span>
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
                ${total.toFixed(2)} {/* Use calculated total */}
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
