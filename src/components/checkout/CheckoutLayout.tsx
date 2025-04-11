import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/landing/Navbar'; // Assuming Navbar is here
import Footer from '@/components/landing/Footer'; // Assuming Footer is here

const CheckoutLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20"> {/* Add padding-top to account for fixed Navbar */}
        <Outlet /> {/* Child routes (checkout steps) will render here */}
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutLayout;
