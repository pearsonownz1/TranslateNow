import React from "react";
import Navbar from "../landing/Navbar";
import FAQ from "../landing/FAQ";
import Footer from "../landing/Footer";

const ResourcesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Resources
          </h1>
          <p className="text-xl text-gray-600 text-center mt-4 max-w-3xl mx-auto">
            Helpful information about document translation services
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Translation Guides</h2>
              <p className="text-gray-600 mb-4">
                Learn about the translation process and requirements for
                different document types.
              </p>
              <a href="#" className="text-blue-600 hover:underline">
                View Guides
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Blog Articles</h2>
              <p className="text-gray-600 mb-4">
                Read our latest articles about translation services, immigration
                updates, and more.
              </p>
              <a href="#" className="text-blue-600 hover:underline">
                Read Blog
              </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Document Checklists
              </h2>
              <p className="text-gray-600 mb-4">
                Download checklists for common translation needs like
                immigration, academic, and legal.
              </p>
              <a href="#" className="text-blue-600 hover:underline">
                Get Checklists
              </a>
            </div>
          </div>
        </div>
      </section>

      <FAQ />
      <Footer />
    </div>
  );
};

export default ResourcesPage;
