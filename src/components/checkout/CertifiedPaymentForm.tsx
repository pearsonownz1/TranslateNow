import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase-client";

interface CertifiedPaymentFormProps {
  onSubmit?: (formData: any) => void;
  isProcessing?: boolean;
  amount: number;
  orderId: string;
}

const CertifiedPaymentForm = ({
  onSubmit = () => {},
  isProcessing = false,
  amount,
  orderId,
}: CertifiedPaymentFormProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!cardNumber || !expiryDate || !cvc || !nameOnCard) {
      setError("Please fill in all fields");
      return;
    }

    try {
      // In a real implementation, you would use Stripe Elements
      // This is a simplified mock implementation
      const { data: user } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be logged in to make a payment");
        return;
      }

      // Call the process-payment edge function
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-process-payment",
        {
          body: {
            paymentMethodId:
              "pm_mock_" + Math.random().toString(36).substring(2, 15),
            amount,
            orderId,
            customerEmail: user.user?.email,
          },
        },
      );

      if (error) throw error;

      onSubmit(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Payment processing failed",
      );
      console.error("Payment error:", err);
    }
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
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
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
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  name="cvc"
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nameOnCard">Name on Card</Label>
              <Input
                id="nameOnCard"
                name="nameOnCard"
                placeholder="John Smith"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

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
