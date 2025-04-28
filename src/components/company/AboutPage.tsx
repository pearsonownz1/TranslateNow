import React from 'react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">About Us</h1>
        <p className="text-gray-700">
          Information about OpenEval will go here. We are dedicated to providing high-quality translation services...
          {/* Add more placeholder content */}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
