import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check } from "lucide-react";

const Hero = () => {
  return (
    <main> {/* Added main tag */}
      <section aria-labelledby="hero-heading" className="relative bg-gradient-to-b from-gray-50 to-white pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4">
              USCIS & Government Accepted
            </Badge>

            {/* Use id for aria-labelledby */}
            <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
              Certified Document{" "}
              <span className="text-blue-600">Translation</span> Services
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl">
              Fast, accurate, and certified translations for immigration, legal,
              and academic purposes. 100% acceptance guarantee.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Link to="/checkout" className="flex items-center">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link to="/quote">Get Quote</Link>
              </Button>
            </div>

            <div className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700">USCIS Accepted</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700">24-Hour Delivery</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-700">100% Accuracy</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="relative z-10 bg-white rounded-xl shadow-xl overflow-hidden">
              <img
                src="/images/your-new-hero-image.jpg" // Updated image path
                alt="Professional document translation"
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="text-white">
                  <div className="font-medium">Trusted by 10,000+ clients</div>
                  <div className="text-sm opacity-80">
                    For immigration, legal, and academic needs
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200 rounded-full opacity-70 blur-xl"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-200 rounded-full opacity-70 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Hero;
