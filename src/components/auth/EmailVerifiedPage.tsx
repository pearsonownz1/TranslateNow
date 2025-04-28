import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const EmailVerifiedPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
            Email Successfully Verified!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Thank you for verifying your email address. You can now log in to your account.
          </p>
          <Button asChild className="w-full">
            <Link to="/login">Go to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerifiedPage;
