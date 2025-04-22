import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const PaymentSuccessPage = () => {
  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader className="items-center text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <CardTitle className="text-2xl font-bold">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Thank you for your order. Your translation request has been received and is being processed.
          </p>
          <p className="text-muted-foreground">
            You will receive an email confirmation shortly with your order details. You can also view your order status in your dashboard.
          </p>
          <div className="flex justify-center space-x-4 pt-4">
            <Button asChild variant="outline">
              <Link to="/dashboard/orders">View My Orders</Link>
            </Button>
            <Button asChild>
              <Link to="/">Back to Homepage</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
