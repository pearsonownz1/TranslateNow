import React from "react";
import Navbar from "../landing/Navbar";
import Pricing from "../landing/Pricing";
import CTASection from "../landing/CTASection";
import Footer from "../landing/Footer";

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Pricing Plans
          </h1>
          <p className="text-xl text-gray-600 text-center mt-4 max-w-3xl mx-auto">
            Choose the service level that fits your needs and timeline
          </p>
        </div>
      </div>
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  );
};

export default PricingPage;
