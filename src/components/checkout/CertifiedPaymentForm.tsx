import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CertifiedPaymentFormProps {
  onSubmit?: (formData: any) => void;
  isProcessing?: boolean;
  amount: number;
}

const CertifiedPaymentForm = ({
  onSubmit = () => {},
  isProcessing = false,
  amount,
}: CertifiedPaymentFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" name="cvc" placeholder="123" required />
              </div>
            </div>

            <div>
              <Label htmlFor="nameOnCard">Name on Card</Label>
              <Input
                id="nameOnCard"
                name="nameOnCard"
                placeholder="John Smith"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full" disabled={isProcessing}>
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

export default CertifiedPaymentForm;
