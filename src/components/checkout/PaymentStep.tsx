import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, CreditCard, Lock } from "lucide-react";
import OrderSummary from "./OrderSummary";
import StripePaymentForm from "./StripePaymentForm";
import { OrderData } from "@/App"; // Import OrderData type from App.tsx

interface PaymentStepProps {
  orderData: OrderData; // Expect the full order data collected so far
  onComplete?: () => void; // Passed down from App.tsx CheckoutFlow
  onBack?: () => void;     // Passed down from App.tsx CheckoutFlow
}

// Define pricing structure (move this to a config file or fetch from backend ideally)
// Ensure these keys match the 'id' values used in the respective step components
const PRICES = {
  document: {
    standard: 50,
    certificate: 75,
    legal: 100,
    medical: 120,
    technical: 90,
  },
  service: {
    standard: 0, // Assuming base service is included in doc price
    expedited: 30,
    certified: 50,
  },
  delivery: {
    digital: 0,
    physical: 20,
    'expedited-physical': 35,
  },
  // taxRate: 0.08, // Removed tax rate
};

const PaymentStep = ({
  orderData,
  onComplete = () => {},
  onBack = () => {},
}: PaymentStepProps) => {
  // State only needed for UI elements within this step, like the payment method tab
  const [paymentMethod, setPaymentMethod] = useState("card");

  // --- Price Calculation Logic ---
  const calculateTotal = (data: OrderData): { subtotal: number, total: number, amountInCents: number } => { // Removed tax from return type
    let subtotal = 0;

    // Document Type Price
    const docType = data.documentLanguage?.documentType as keyof typeof PRICES.document | undefined;
    if (docType && PRICES.document[docType] !== undefined) {
      subtotal += PRICES.document[docType];
    }

    // Service Level Price (Additive)
    const serviceId = data.serviceOptions?.serviceId as keyof typeof PRICES.service | undefined;
     if (serviceId && PRICES.service[serviceId] !== undefined) {
       subtotal += PRICES.service[serviceId];
     }

    // Delivery Option Price
    const deliveryId = data.deliveryOptions?.deliveryId as keyof typeof PRICES.delivery | undefined;
     if (deliveryId && PRICES.delivery[deliveryId] !== undefined) {
       subtotal += PRICES.delivery[deliveryId];
     }

     // TODO: Add price per document/page if applicable
     // const numFiles = data.documentLanguage?.files?.length || 0;
     // subtotal += numFiles * PRICE_PER_FILE_OR_PAGE;

    // const tax = subtotal * PRICES.taxRate; // Removed tax calculation
    const total = subtotal; // Total is now just the subtotal
    const amountInCents = Math.round(total * 100); // Ensure it's an integer

    console.log("Calculated Prices:", { subtotal, total, amountInCents, data }); // Log for debugging (removed tax)
    return { subtotal, total, amountInCents }; // Removed tax from return object
  };

  const { subtotal, total, amountInCents } = calculateTotal(orderData); // Removed tax from destructuring
  // -----------------------------

  // No internal handlePayment needed, StripePaymentForm calls onComplete directly

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Information
        </h2>
        <p className="text-gray-600">
          Review your order and complete your payment.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 mr-2" />
                  Your payment details are always transmitted securely
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="card"
                className="w-full"
                onValueChange={setPaymentMethod}
              >
                <TabsList className="grid w-full grid-cols-1 mb-6">
                  <TabsTrigger value="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="card">
                  {/* Pass the dynamically calculated total price in cents and the final onComplete handler */}
                  <StripePaymentForm
                    onSubmit={onComplete}
                    amountInCents={amountInCents}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={onBack}>
                  Back
                </Button>
                {/* The "Pay Now" button is now inside StripePaymentForm */}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-80">
          <div className="sticky top-6 space-y-6">
            {/* Update OrderSummary to use calculated values and data from orderData */}
            <OrderSummary
              // Pass calculated values and selections
              // Note: OrderSummary might need internal adjustments if its props changed
              documentType={orderData.documentLanguage?.documentType || 'N/A'}
              sourceLanguage={orderData.documentLanguage?.sourceLanguage || 'N/A'}
              targetLanguage={orderData.documentLanguage?.targetLanguage || 'N/A'}
              serviceLevel={orderData.serviceOptions?.serviceId || 'N/A'}
              price={subtotal} // Pass subtotal to the price prop
              // tax={tax} // Tax prop already removed/commented
              // total={total} // Total prop already removed/commented
              deliveryTime={ // Example logic, adjust as needed
                orderData.serviceOptions?.serviceId === "expedited" || orderData.deliveryOptions?.deliveryId === "expedited-physical"
                  ? "1-2 business days"
                  : "3-5 business days"
              }
              wordCount={1250} // Placeholder - calculate based on uploaded files if needed
            />

            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-gray-900" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    Secure Checkout
                  </h3>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>
                      Your payment information is encrypted and secure. We never
                      store your full credit card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
