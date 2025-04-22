import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock, Loader2 } from "lucide-react"; // Added Loader2
import {
  useStripe,
  useElements,
  CardElement, // Use Stripe's CardElement
} from "@stripe/react-stripe-js";
import { StripeCardElementOptions } from "@stripe/stripe-js";
import { useToast } from "@/components/ui/use-toast"; // For showing errors

interface StripePaymentFormProps {
  onSubmit?: () => void; // This will be called on successful payment
  amountInCents: number; // Add prop for the amount
}

// Basic styling for the CardElement
const CARD_ELEMENT_OPTIONS: StripeCardElementOptions = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
      // Border and padding should be applied via CSS to the container div
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  // Hide postal code if not needed for your region/setup
  hidePostalCode: true,
};


const StripePaymentForm = ({
  onSubmit = () => {},
  amountInCents, // Destructure the new prop
}: StripePaymentFormProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      console.error("Stripe.js has not loaded yet.");
      setError("Payment system is not ready. Please wait a moment and try again.");
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      console.error("Card Element not found.");
      setError("Payment input not found. Please refresh the page.");
      setIsProcessing(false);
      return;
    }

    try {
      // **1. Create PaymentIntent on your backend**
      // Replace with your actual API endpoint and pass necessary data (amount, currency, orderId etc.)
      // The amount should be calculated based on the order details (service, delivery, etc.)
      // IMPORTANT: Amount should be in the smallest currency unit (e.g., cents for USD)
      const response = await fetch('/api/create-payment-intent', { // Reverted endpoint name
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
             amount: amountInCents, // Use the passed amount
             currency: 'usd' // Assuming USD, make dynamic if needed
             // Add other necessary order details if your backend needs them
            }),
      });

      // Improved error handling for non-JSON responses (like 405)
      let clientSecret: string | undefined;
      let backendError: { message?: string } | undefined;

      try {
        // Only proceed if the response status is OK (e.g., 2xx)
        if (!response.ok) {
            // Attempt to read the response body as text for debugging
            const errorText = await response.text();
            console.error(`Server responded with ${response.status}:`, errorText);
            throw new Error(`Server error: ${response.statusText || 'Failed to fetch'}`);
        }
        // Try parsing JSON only if response is ok
        const data = await response.json();
        clientSecret = data.clientSecret;
        backendError = data.error; // Assuming error is nested like { error: { message: '...' } }

      } catch (err: any) {
        // Handle JSON parsing errors or network errors
        console.error('Error processing server response:', err);
        // If it was a JSON parse error, the original response might still be useful as text
        if (err instanceof SyntaxError && response) {
            const text = await response.text().catch(() => 'Could not read response text.'); // Avoid nested errors
            console.error('Non-JSON response received:', text);
        }
        throw new Error(err.message || 'Invalid server response');
      }


      if (backendError || !clientSecret) {
        throw new Error(backendError?.message || 'Failed to initialize payment.');
      }

      // **2. Confirm the card payment**
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            // billing_details: { // Optional: Add billing details if needed
            //   name: 'Jenny Rosen',
            // },
          },
        }
      );

      if (stripeError) {
        // Show error to your customer (e.g., insufficient funds, card declined).
        console.error("Stripe payment error:", stripeError);
        setError(stripeError.message || "An error occurred during payment.");
        toast({ variant: "destructive", title: "Payment Failed", description: stripeError.message });
       } else if (paymentIntent?.status === 'succeeded') {
         // Payment succeeded!
         console.log("Payment successful!", paymentIntent);
         // toast({ title: "Payment Successful", description: "Your order is being processed." }); // Remove toast, rely on redirect
         onSubmit(); // Trigger the next step (saving order, navigating)
       } else {
          console.log("Payment status:", paymentIntent?.status)
         setError("Payment processing failed. Please try again.");
         toast({ variant: "destructive", title: "Payment Failed", description: "Could not process payment." });
      }

    } catch (err: any) {
       console.error("Payment processing error:", err);
       setError(err.message || "An unexpected error occurred.");
       toast({ variant: "destructive", title: "Payment Error", description: err.message || "An unexpected error occurred." });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="shadow-none border-0"> {/* Removed shadow/border to blend better */}
      {/* Removed CardHeader as title is in PaymentStep */}
      <CardContent className="pt-0"> {/* Removed padding top */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-element">Card Details</Label>
            {/* Use Stripe's CardElement */}
            <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
          </div>

          {/* Display errors */}
          {error && <div className="text-sm text-destructive pt-1">{error}</div>}

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={!stripe || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                "Pay Now" // Consider updating text based on actual amount
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center text-xs text-muted-foreground pt-2">
            <Lock className="h-3 w-3 mr-1" />
            <span>Payments processed securely by Stripe</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
