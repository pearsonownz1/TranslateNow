import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StripePaymentFormProps {
  onSubmit?: (paymentMethod?: any) => void;
  isProcessing?: boolean;
  amount: number;
}

const StripePaymentForm = ({
  onSubmit = () => {},
  isProcessing = false,
  amount,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setError(null);
    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    // Create a payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      setError(error.message || "An error occurred with your payment");
      return;
    }

    // Pass the payment method to the parent component
    onSubmit(paymentMethod);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#32325d",
        fontFamily: "Arial, sans-serif",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <Card className="shadow-md border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-green-600" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="border-2 border-gray-200 rounded-md p-4 bg-white shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Information
              </label>
              <CardElement options={cardElementOptions} />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="h-4 w-4 text-green-600" />
              <span>Your card details are encrypted and secure</span>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 mt-2 p-2 bg-red-50 rounded border border-red-200">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3"
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay ${(amount / 100).toFixed(2)}`
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center text-xs text-muted-foreground pt-2">
            <Lock className="h-3 w-3 mr-1 text-green-600" />
            <span>Payments are secure and encrypted with SSL</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
