import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PersonalPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20"> {/* Adjust pt based on Navbar height */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Personal Document Translation
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Reliable and confidential translation for your personal documents, including letters, emails, certificates, and more. Handled with care and accuracy.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <Link to="/checkout">Start Your Translation</Link>
            </Button>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">Why Trust Us With Your Personal Documents?</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-700">Strict Confidentiality</h3>
                <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Your privacy is our top priority.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-700">Native-Speaking Translators</h3>
                <p className="text-gray-600">Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-700">Quick & Affordable</h3>
                <p className="text-gray-600">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-semibold text-center mb-12 text-gray-800">Examples of Personal Documents</h2>
             <ul className="list-disc list-inside max-w-2xl mx-auto text-gray-600 space-y-2">
                <li>Personal Letters & Emails</li>
                <li>Driver's Licenses</li>
                <li>Medical Records</li>
                <li>Bank Statements</li>
                <li>Resumes / CVs</li>
                <li>Certificates (non-academic/legal)</li>
                <li>And more...</li>
             </ul>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default PersonalPage;
