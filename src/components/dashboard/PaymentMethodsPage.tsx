import React, { useState, useEffect } from 'react'; // Added useEffect
import { CreditCard } from 'lucide-react';
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaPaypal } from 'react-icons/fa';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast'; // Import useToast
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import AddCardForm from './AddCardForm'; // Import the actual form component
import { supabase } from '@/lib/supabase'; // Import supabase for auth token

// Load Stripe outside of component render to avoid recreating on every render
// Ensure VITE_STRIPE_PUBLISHABLE_KEY is set in your .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const PaymentMethodsPage = () => {
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch SetupIntent client secret when dialog opens
  useEffect(() => {
    const fetchSetupIntent = async () => {
      if (isAddCardDialogOpen && !clientSecret) { // Only fetch if dialog is open and secret not yet fetched
        setLoadingSecret(true);
        setFetchError(null);
        try {
          // Get Supabase session token
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError || !session) {
            throw new Error(sessionError?.message || "User not authenticated.");
          }

          const response = await fetch('/api/create-setup-intent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`, // Send auth token
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to create setup intent: ${response.statusText}`);
          }

          const data = await response.json();
          if (!data.clientSecret) {
             throw new Error("Client secret not received from server.");
          }
          setClientSecret(data.clientSecret);
        } catch (error: any) {
          console.error("Error fetching setup intent:", error);
          setFetchError(error.message || "Could not load payment form.");
          toast({
            title: "Error",
            description: error.message || "Could not load payment form. Please try again.",
            variant: "destructive",
          });
          // Optionally close the dialog on error
          // setIsAddCardDialogOpen(false);
        } finally {
          setLoadingSecret(false);
        }
      } else if (!isAddCardDialogOpen) {
         // Reset secret when dialog closes so it refetches next time
         setClientSecret(null);
         setFetchError(null);
      }
    };

    fetchSetupIntent();
  }, [isAddCardDialogOpen, clientSecret, toast]); // Add clientSecret to dependencies

  const handleSuccess = () => {
    setIsAddCardDialogOpen(false); // Close dialog on success
    // TODO: Optionally refresh the list of saved payment methods here
  };

  const handleCancel = () => {
    setIsAddCardDialogOpen(false); // Close dialog on cancel
  };

  return (
    // Centering container with minimum height
    <div className="flex justify-center items-center min-h-[400px]">
      {/* Styled card container */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">

        {/* Icon and Title Section */}
        <div className="flex flex-col items-center mb-6">
          <CreditCard className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-600">Save a payment method for faster checkout</p>
        </div>

        {/* Buttons Section */}
        <div className="space-y-4">

          {/* Add Credit/Debit Card Dialog */}
          <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-full flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                <span>Add credit or debit card</span>
                <div className="flex gap-2 items-center">
                  <FaCcVisa className="text-xl text-blue-700" />
                  <FaCcMastercard className="text-xl text-orange-500" />
                  <FaCcAmex className="text-xl text-blue-500" />
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add a New Card</DialogTitle>
                <DialogDescription>
                  Enter your card details below. Your information is securely handled by Stripe.
                </DialogDescription>
              </DialogHeader>

              {/* Conditionally render based on loading/error/secret */}
              {loadingSecret && <p className="py-8 text-center">Loading payment form...</p>}
              {fetchError && <p className="py-8 text-center text-red-600">{fetchError}</p>}
              {clientSecret && !loadingSecret && !fetchError && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <AddCardForm
                    clientSecret={clientSecret}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                  />
                </Elements>
              )}
            </DialogContent>
          </Dialog>

          {/* Add PayPal Button (remains a simple button for now) */}
          <button className="w-full flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors text-left">
            <span>Add a PayPal account</span>
            <FaPaypal className="text-2xl text-blue-800" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentMethodsPage;
