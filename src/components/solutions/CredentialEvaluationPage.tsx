import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react"; // Example icons

const CredentialEvaluationPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6">
            Credential Evaluation Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get your foreign academic credentials evaluated for U.S. equivalency. Accepted by universities, employers, and licensing boards across the United States.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link to="/checkout?service=evaluation" className="flex items-center"> {/* Update link if checkout flow differs */}
                Start Evaluation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features/Benefits Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose OpenEval for Credential Evaluation?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 border border-gray-200 rounded-lg shadow-sm">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Widely Accepted</h3>
              <p className="text-gray-600">Reports recognized by USCIS, educational institutions, and employers nationwide.</p>
            </div>
            {/* Feature 2 */}
            <div className="text-center p-6 border border-gray-200 rounded-lg shadow-sm">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Turnaround</h3>
              <p className="text-gray-600">Standard and rush processing options available to meet your deadlines.</p>
            </div>
            {/* Feature 3 */}
            <div className="text-center p-6 border border-gray-200 rounded-lg shadow-sm">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accurate & Reliable</h3>
              <p className="text-gray-600">Expert evaluators ensure precise U.S. equivalency assessments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Placeholder) */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Simple Evaluation Process</h2>
          <p className="text-lg text-gray-600 mb-8">Submit your documents, we evaluate, you receive your report.</p>
          {/* Add more detailed steps here */}
          <Button asChild size="lg">
            <Link to="/checkout?service=evaluation">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Evaluate Your Credentials?</h2>
          <p className="text-lg text-gray-600 mb-8">Start your application today and take the next step in your academic or professional journey.</p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link to="/checkout?service=evaluation">
              Order Your Evaluation Report
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CredentialEvaluationPage;
