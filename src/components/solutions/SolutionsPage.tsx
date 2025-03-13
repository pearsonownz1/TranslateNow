import React from "react";
import Navbar from "../landing/Navbar";
import DocumentTypes from "../landing/DocumentTypes";
import Features from "../landing/Features";
import CTASection from "../landing/CTASection";
import Footer from "../landing/Footer";

const SolutionsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Translation Solutions
          </h1>
          <p className="text-xl text-gray-600 text-center mt-4 max-w-3xl mx-auto">
            Professional translation services for all your document needs
          </p>
        </div>
      </div>
      <DocumentTypes />
      <Features />
      <CTASection />
      <Footer />
    </div>
  );
};

export default SolutionsPage;
