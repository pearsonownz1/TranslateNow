import React from 'react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <div className="prose max-w-none"> {/* Basic prose styling */}
          <p>
            Welcome to OpenEval! These terms and conditions outline the rules and regulations for the use of OpenEval's Website, located at [Your Website URL].
          </p>
          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use OpenEval if you do not agree to take all of the terms and conditions stated on this page.
          </p>
          {/* Add more placeholder sections for Terms of Service */}
          <h2>License</h2>
          <p>
            Unless otherwise stated, OpenEval and/or its licensors own the intellectual property rights for all material on OpenEval. All intellectual property rights are reserved. You may access this from OpenEval for your own personal use subjected to restrictions set in these terms and conditions.
          </p>
          <h2>Disclaimer</h2>
          <p>
            The materials on OpenEval's website are provided on an 'as is' basis. OpenEval makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          {/* ... more sections ... */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
