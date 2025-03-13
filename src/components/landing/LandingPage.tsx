import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import DocumentTypes from "./DocumentTypes";
import Testimonials from "./Testimonials";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import CTASection from "./CTASection";
import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <DocumentTypes />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
