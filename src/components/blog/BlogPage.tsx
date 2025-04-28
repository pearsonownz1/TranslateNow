import React from 'react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

const BlogPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Blog</h1>
        <p className="text-gray-700">
          Welcome to the OpenEval blog! Check back soon for articles on translation, language, and more.
          {/* Placeholder for blog posts list */}
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
