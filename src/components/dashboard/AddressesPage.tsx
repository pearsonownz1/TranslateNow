import React from 'react';
import { MapPin } from 'lucide-react'; // Keep MapPin import

const AddressesPage = () => {
  return (
    // Centering container with minimum height
    <div className="flex justify-center items-center min-h-[400px]">
      {/* Styled card container */}
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">

        {/* Icon and Title Section */}
        <div className="flex flex-col items-center mb-6">
          {/* Use MapPin icon from lucide-react */}
          <MapPin className="h-12 w-12 text-blue-400 mb-2" />
          <p className="text-gray-600">Save a shipping address for faster checkout.</p>
          {/* Placeholder text for when no addresses are saved */}
          <p className="text-sm text-gray-500 mt-1">No addresses saved yet.</p>
          {/* TODO: Conditionally render saved addresses or this placeholder */}
        </div>

        {/* Add Address Button */}
        {/* Using a standard button style, adjust as needed */}
        <button className="border px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
          + Add Address
        </button>
        {/* TODO: Implement add address functionality (e.g., open a modal) */}

      </div>
    </div>
  );
};

export default AddressesPage;
