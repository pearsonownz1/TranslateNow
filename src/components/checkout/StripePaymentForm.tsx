import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Lock } from "lucide-react";

interface StripePaymentFormProps {
  onSubmit?: () => void;
  isProcessing?: boolean;
}

const StripePaymentForm = ({
  onSubmit = () => {},
  isProcessing = false,
}: StripePaymentFormProps) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvc: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Card Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={handleChange}
                className="pl-10"
                required
              />
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardName">Name on Card</Label>
            <Input
              id="cardName"
              name="cardName"
              placeholder="John Smith"
              value={cardDetails.cardName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={cardDetails.expiryDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                name="cvc"
                placeholder="123"
                type="password"
                value={cardDetails.cvc}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isProcessing}>
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
                  Processing Payment...
                </>
              ) : (
                "Pay Now"
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
