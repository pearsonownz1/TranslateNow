import React from 'react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

const CookiePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
        <div className="prose max-w-none">
          <p>
            This is the Cookie Policy for OpenEval, accessible from [Your Website URL].
          </p>
          <h2>What Are Cookies</h2>
          <p>
            As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience. This page describes what information they gather, how we use it and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored however this may downgrade or 'break' certain elements of the sites functionality.
          </p>
          {/* Add more placeholder sections for Cookie Policy */}
          <h2>How We Use Cookies</h2>
          <p>
            We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site. It is recommended that you leave on all cookies if you are not sure whether you need them or not in case they are used to provide a service that you use.
          </p>
          <h2>Disabling Cookies</h2>
          <p>
            You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of the this site. Therefore it is recommended that you do not disable cookies.
          </p>
          {/* ... more sections ... */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePage;
