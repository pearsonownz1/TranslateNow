import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { StripeCardElementOptions } from '@stripe/stripe-js';

interface AddCardFormProps {
  clientSecret: string;
  onSuccess: () => void; // Callback on successful card setup
  onCancel: () => void;  // Callback to close the dialog/form
}

// Basic styling options for the CardElement
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
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const AddCardForm: React.FC<AddCardFormProps> = ({ clientSecret, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null); // Clear previous errors

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      console.error("Stripe.js has not loaded yet.");
      setErrorMessage("Payment system is not ready. Please try again in a moment.");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      console.error("CardElement not found");
      setErrorMessage("Could not find the card input field. Please refresh and try again.");
      return;
    }

    setIsLoading(true);

    const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: cardElement,
        // You can add billing details here if needed:
        // billing_details: {
        //   name: 'Jenny Rosen', // Get name from user profile or form
        // },
      },
    });

    setIsLoading(false);

    if (error) {
      console.error("Stripe confirmCardSetup error:", error);
      setErrorMessage(error.message || "An unexpected error occurred. Please try again.");
      toast({
        title: "Failed to Save Card",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } else {
      if (setupIntent?.status === 'succeeded') {
        console.log("Card setup successful:", setupIntent);
        toast({
          title: "Card Added Successfully",
          description: "Your new payment method has been saved.",
        });
        cardElement.clear(); // Clear the card element
        onSuccess(); // Call the success callback (e.g., close dialog, refresh list)
      } else {
        console.warn("SetupIntent status:", setupIntent?.status);
        setErrorMessage(`Card setup failed with status: ${setupIntent?.status}. Please try again.`);
        toast({
          title: "Card Setup Incomplete",
          description: `Status: ${setupIntent?.status}. Please try again or contact support.`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} id="add-card-form" className="space-y-4">
      <div className="p-4 border rounded-md">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
      <div className="flex justify-end gap-2 pt-2">
         <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
           Cancel
         </Button>
        <Button type="submit" disabled={!stripe || isLoading}>
          {isLoading ? 'Saving...' : 'Save Card'}
        </Button>
      </div>
    </form>
  );
};

export default AddCardForm;
