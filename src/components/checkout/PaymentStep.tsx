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
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { useToast } from "@/components/ui/use-toast";

interface PaymentStepProps {
  onComplete?: () => void;
  onBack?: () => void;
  orderDetails?: {
    documentType: string;
    sourceLanguage: string;
    targetLanguage: string;
    serviceLevel: string;
    price: number;
  };
}

const PaymentStep = ({
  onComplete = () => {},
  onBack = () => {},
  orderDetails = {
    documentType: "Standard Document",
    sourceLanguage: "English",
    targetLanguage: "Spanish",
    serviceLevel: "Standard",
    price: 99.99,
  },
}: PaymentStepProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const { toast } = useToast();

  // Calculate tax and total
  const taxRate = 0.08;
  const taxAmount = orderDetails.price * taxRate;
  const totalPrice = orderDetails.price + taxAmount;
  // Convert to cents for Stripe
  const amountInCents = Math.round(totalPrice * 100);

  const handlePayment = (paymentMethod?: any) => {
    setIsProcessing(true);

    // In a real app, you would send the payment method ID to your server
    // to create a payment intent and complete the payment
    console.log("Payment method:", paymentMethod);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);

      toast({
        title: "Payment successful",
        description: `Your payment of ${totalPrice.toFixed(2)} has been processed successfully.`,
      });

      onComplete();
    }, 2000);
  };

  const handlePayPalPayment = () => {
    setIsProcessing(true);

    // Simulate PayPal payment processing
    setTimeout(() => {
      setIsProcessing(false);

      toast({
        title: "PayPal payment successful",
        description: `Your payment of ${totalPrice.toFixed(2)} has been processed successfully.`,
      });

      onComplete();
    }, 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Information
        </h2>
        <p className="text-gray-600">
          Your payment details are securely processed and encrypted.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="w-full max-w-3xl mx-auto">
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Payment Method</span>
                <div className="flex items-center gap-3">
                  <svg
                    viewBox="0 0 38 24"
                    width="38"
                    height="24"
                    role="img"
                    aria-labelledby="pi-visa"
                  >
                    <title id="pi-visa">Visa</title>
                    <path
                      opacity=".07"
                      d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                    ></path>
                    <path
                      fill="#fff"
                      d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                    ></path>
                    <path
                      d="M28.3 10.1H28c-.4 1-.7 1.5-1 3h1.9c-.3-1.5-.3-2.2-.6-3zm2.9 5.9h-1.7c-.1 0-.1 0-.2-.1l-.2-.9-.1-.2h-2.4c-.1 0-.2 0-.2.2l-.3.9c0 .1-.1.1-.1.1h-2.1l.2-.5L27 8.7c0-.5.3-.7.8-.7h1.5c.1 0 .2 0 .2.2l1.4 6.5c.1.4.2.7.2 1.1.1.1.1.1.1.2zm-13.4-.3l.4-1.8c.1 0 .2.1.2.1.7.3 1.4.5 2.1.4.2 0 .5-.1.7-.2.5-.2.5-.7.1-1.1-.2-.2-.5-.3-.8-.5-.4-.2-.8-.4-1.1-.7-1.2-1-.8-2.4-.1-3.1.6-.4.9-.8 1.7-.8 1.2 0 2.5 0 3.1.2h.1c-.1.6-.2 1.1-.4 1.7-.5-.2-1-.4-1.5-.4-.3 0-.6 0-.9.1-.2 0-.3.1-.4.2-.2.2-.2.5 0 .7l.5.4c.4.2.8.4 1.1.6.5.3 1 .8 1.1 1.4.2.9-.1 1.7-.9 2.3-.5.4-.7.6-1.4.6-1.4 0-2.5.1-3.4-.2-.1.2-.1.2-.2.1zm-3.5.3c.1-.7.1-.7.2-1 .5-2.2 1-4.5 1.4-6.7.1-.2.1-.3.3-.3H18c-.2 1.2-.4 2.1-.7 3.2-.3 1.5-.6 3-1 4.5 0 .2-.1.2-.3.2M5 8.2c0-.1.2-.2.3-.2h3.4c.5 0 .9.3 1 .8l.9 4.4c0 .1 0 .1.1.2 0-.1.1-.1.1-.1l2.1-5.1c-.1-.1 0-.2.1-.2h2.1c0 .1 0 .1-.1.2l-3.1 7.3c-.1.2-.1.3-.2.4-.1.1-.3 0-.5 0H9.7c-.1 0-.2 0-.2-.2L7.9 9.5c-.2-.2-.5-.5-.9-.6-.6-.3-1.7-.5-1.9-.5L5 8.2z"
                      fill="#142688"
                    ></path>
                  </svg>
                  <svg
                    viewBox="0 0 38 24"
                    width="38"
                    height="24"
                    role="img"
                    aria-labelledby="pi-mastercard"
                  >
                    <title id="pi-mastercard">Mastercard</title>
                    <path
                      opacity=".07"
                      d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z"
                    ></path>
                    <path
                      fill="#fff"
                      d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32"
                    ></path>
                    <circle fill="#EB001B" cx="15" cy="12" r="7"></circle>
                    <circle fill="#F79E1B" cx="23" cy="12" r="7"></circle>
                    <path
                      fill="#FF5F00"
                      d="M22 12c0-2.4-1.2-4.5-3-5.7-1.8 1.3-3 3.4-3 5.7s1.2 4.5 3 5.7c1.8-1.3 3-3.4 3-5.7z"
                    ></path>
                  </svg>
                </div>
              </CardTitle>
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
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card
                  </TabsTrigger>
                  <TabsTrigger
                    value="paypal"
                    className="flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M17.5 7H17a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v.5" />
                      <path d="M10 13h2.5a2 2 0 0 0 2-2v-.5" />
                      <path d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                    </svg>
                    PayPal
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="card">
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      onSubmit={handlePayment}
                      isProcessing={isProcessing}
                      amount={amountInCents}
                    />
                  </Elements>
                </TabsContent>
                <TabsContent value="paypal">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="120"
                          height="30"
                          viewBox="0 0 124 33"
                          className="mx-auto"
                        >
                          <path
                            d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.97-1.142-2.694-1.746-4.985-1.746z"
                            fill="#003087"
                          />
                          <path
                            d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.97-1.142-2.694-1.746-4.985-1.746z"
                            fill="#003087"
                          />
                          <path
                            d="M53.867 13.417c-.23-1.348-.879-2.447-1.923-3.205-1.019-.74-2.308-1.065-3.911-1.065h-7.475c-.667 0-1.235.485-1.34 1.145l-3.212 20.336a.806.806 0 0 0 .795.932h4.225c.548 0 1.014-.385 1.099-.927l.811-5.141a1.437 1.437 0 0 1 1.414-1.216h2.364c4.775 0 7.548-2.31 8.283-6.895.309-1.894.158-3.491-.699-4.576-.635-.803-1.665-1.387-2.997-1.702l-.434-.686z"
                            fill="#009cde"
                          />
                        </svg>
                      </div>
                      <p className="mb-6 text-muted-foreground">
                        Click the button below to pay with PayPal
                      </p>
                      <Button
                        onClick={handlePayPalPayment}
                        disabled={isProcessing}
                        className="w-full bg-gray-900 hover:bg-gray-800"
                      >
                        {isProcessing ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          `Pay ${totalPrice.toFixed(2)} with PayPal`
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between pt-6">
                <Button type="button" variant="outline" onClick={onBack}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-600" />
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
  );
};

export default PaymentStep;
