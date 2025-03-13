import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Your Documents Translated?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Start your certified translation today and receive your documents in
            as little as 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-blue-700 hover:bg-gray-100"
            >
              <Link to="/checkout" className="flex items-center">
                Start Translation Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/10"
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
