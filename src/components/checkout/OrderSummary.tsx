import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface OrderSummaryProps {
  documentType?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  serviceLevel?: string;
  price?: number;
  deliveryTime?: string;
  wordCount?: number;
}

const OrderSummary = ({
  documentType = "Standard Document",
  sourceLanguage = "English",
  targetLanguage = "Spanish",
  serviceLevel = "Standard",
  price = 79.99,
  deliveryTime = "3-5 business days",
  wordCount = 1250,
}: OrderSummaryProps) => {
  // Calculate tax (assuming 8% tax rate)
  const taxRate = 0.08;
  const taxAmount = price * taxRate;
  const totalPrice = price + taxAmount;

  return (
    <Card className="w-full max-w-[350px] bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Document Type:</span>
            <span className="text-sm">{documentType}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Languages:</span>
            <span className="text-sm">
              {sourceLanguage} → {targetLanguage}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Service Level:</span>
            <Badge
              variant={
                serviceLevel === "Expedited"
                  ? "destructive"
                  : serviceLevel === "Certified"
                    ? "secondary"
                    : "default"
              }
              className="text-xs"
            >
              {serviceLevel}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Word Count:</span>
            <span className="text-sm">{wordCount} words</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Delivery Time:</span>
            <span className="text-sm">{deliveryTime}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Subtotal:</span>
            <span className="text-sm">${price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Tax (8%):</span>
            <span className="text-sm">${taxAmount.toFixed(2)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-base font-bold">Total:</span>
          <span className="text-base font-bold">${totalPrice.toFixed(2)}</span>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            Prices are in USD. Your card will be charged upon order
            confirmation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
