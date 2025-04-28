import React from "react";
import Navbar from "../landing/Navbar"; // Assuming you want the standard navbar
import Footer from "../landing/Footer"; // Assuming you want the standard footer
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ApiDocsPage = () => {
  // TODO: Use environment variable for API base URL
  const apiBaseUrl = "https://api.openeval.com"; // NEW DOMAIN
  const endpointUrl = `${apiBaseUrl}/v1/quote-requests`;

  const requestPayloadExample = `{
  "applicant_name": "Jane Doe",
  "country_of_education": "India",
  "degree_received": "Bachelor of Engineering"
}`;

  const successResponseExample = `{
  "message": "Quote request received successfully",
  "quote_request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}`;

  const callbackPayloadExample = `{
  "quote_request_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "applicant_name": "Jane Doe",
  "us_equivalent": "Bachelor’s Degree in Engineering",
  "status": "completed"
}`;

  const curlExample = `curl -X POST ${endpointUrl} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${requestPayloadExample}'`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Page Header */}
      <div className="pt-32 pb-12 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Partner API Documentation
          </h1>
          <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
            Integrate your application with OpenEval to submit credential evaluation quote requests programmatically.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Obtain your API key and configure your callback URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To use the OpenEval API, you first need an account. Once registered and logged in, navigate to your dashboard's "Integrations" section to generate your unique API key.
              </p>
              <p>
                You will also need to configure a **Callback URL** in the Integrations settings. This is the secure HTTPS endpoint on your server where we will send the results (the US Equivalency) once our team processes the request.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                 <Button asChild>
                   <Link to="/login">Login</Link>
                 </Button>
                 <Button variant="outline" asChild>
                   <Link to="/register">Sign Up</Link>
                 </Button>
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>Authenticate your requests using your API key.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                All API requests must be authenticated using a Bearer token in the `Authorization` header. Use the API key generated in your dashboard.
              </p>
              <pre className="mt-4 p-4 border rounded-md bg-gray-100 text-sm overflow-x-auto">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </pre>
              <p className="mt-2 text-sm text-gray-600">Replace `YOUR_API_KEY` with your actual secret key (starting with `sk_`).</p>
            </CardContent>
          </Card>

          {/* Submitting a Quote Request */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Quote Request</CardTitle>
              <CardDescription>Send applicant details to initiate a quote request.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Make a `POST` request to the following endpoint:</p>
              <pre className="p-4 border rounded-md bg-gray-100 text-sm overflow-x-auto">
                <code>{endpointUrl}</code>
              </pre>
              <p>Include the following JSON payload in the request body:</p>
              <pre className="p-4 border rounded-md bg-gray-100 text-sm overflow-x-auto">
                <code>{requestPayloadExample}</code>
              </pre>
              <h4 className="font-semibold pt-2">Required Fields:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700">
                <li>`applicant_name` (string): The full name of the applicant.</li>
                <li>`country_of_education` (string): The country where the applicant received their education.</li>
                <li>`degree_received` (string): The name of the degree or credential received.</li>
              </ul>
               <h4 className="font-semibold pt-2">Example Request (cURL):</h4>
               <pre className="p-4 border rounded-md bg-gray-100 text-sm overflow-x-auto">
                 <code>{curlExample}</code>
               </pre>
               <h4 className="font-semibold pt-2">Success Response (201 Created):</h4>
               <pre className="p-4 border rounded-md bg-gray-100 text-sm overflow-x-auto">
                 <code>{successResponseExample}</code>
               </pre>
               <p className="text-sm text-gray-600">Store the `quote_request_id` to correlate with the callback later.</p>
            </CardContent>
          </Card>

          {/* Receiving the Callback */}
          <Card>
            <CardHeader>
              <CardTitle>Receiving the Callback (Webhook)</CardTitle>
              <CardDescription>Handle the results sent back to your configured Callback URL.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Once our team processes the request and determines the US Equivalency, we will send a `POST` request to the **Callback URL** you configured in your dashboard's Integrations settings.
              </p>
              <h4 className="font-semibold pt-2">Callback Payload (JSON):</h4>
              <pre className="p-4 border rounded-md bg-gray-100 text-sm overflow-x-auto">
                <code>{callbackPayloadExample}</code>
              </pre>
              <h4 className="font-semibold pt-2">Verifying the Callback (HMAC Signature):</h4>
              <p>
                To ensure the callback genuinely originated from OpenEval, we include a signature in the `X-Webhook-Signature` header. This signature is an HMAC-SHA256 hash generated using your **Webhook Secret** (found in your Integrations settings) and the raw request body.
              </p>
              <p className="text-sm text-gray-700">
                You should compute the HMAC-SHA256 signature on your server using the received raw request body and your stored Webhook Secret. Compare your computed signature (prefixed with `sha256=`) with the value in the `X-Webhook-Signature` header. If they match, the request is authentic. Reject requests with invalid signatures.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                **Important:** Your endpoint should respond with a `2xx` status code (e.g., 200 OK) quickly upon receiving the callback to acknowledge receipt. Any processing should happen asynchronously.
              </p>
            </CardContent>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApiDocsPage;
