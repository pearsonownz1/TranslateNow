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
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="border rounded-md p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && <div className="text-sm text-red-500 mt-2">{error}</div>}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full"
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay $${(amount / 100).toFixed(2)}`
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center text-xs text-muted-foreground pt-2">
            <Lock className="h-3 w-3 mr-1" />
            <span>Payments are secure and encrypted</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
