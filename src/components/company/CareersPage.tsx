import React from 'react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

const CareersPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Careers</h1>
        <p className="text-gray-700">
          Join the OpenEval team! We're always looking for talented individuals passionate about breaking down language barriers.
        </p>
        <p className="text-gray-700 mt-4">
          Current openings will be listed here soon.
          {/* Placeholder for job listings */}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default CareersPage;
