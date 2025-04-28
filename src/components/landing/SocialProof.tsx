import React from "react";
import { Landmark, BadgeCheck } from "lucide-react"; // Keep relevant icons

const SocialProof = () => {
  const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.426 4.849.705c.848.123 1.186 1.158.57 1.753l-3.508 3.419.829 4.831c.145.844-.74 1.485-1.494 1.099L10 16.54l-4.32 2.271c-.754.386-1.639-.255-1.494-1.099l.829-4.831-3.508-3.419c-.616-.595-.278-1.63.57-1.753l4.849-.705L9.132 2.884z" clipRule="evenodd" />
    </svg>
  );

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        {/* Star reviews and client avatars */}
        <div className="flex flex-col items-center gap-3 mb-10 text-center">
          <div className="flex items-center">
             <div className="flex -space-x-2 mr-3">
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-200" src="https://randomuser.me/api/portraits/men/32.jpg" alt="Client 1" />
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-200" src="https://randomuser.me/api/portraits/women/44.jpg" alt="Client 2" />
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-200" src="https://randomuser.me/api/portraits/men/76.jpg" alt="Client 3" />
              </div>
            <div className="flex text-yellow-500">
              <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
            </div>
          </div>
          {/* Updated Text */}
          <p className="text-gray-700 font-medium text-base">
            Trusted by <strong>10,000+</strong> Students, Professionals, and Institutions for Evaluations & Translations
          </p>
        </div>

        {/* Logos - Focused on Acceptance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 text-center items-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
             <Landmark className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 leading-snug">
              Evaluations & Translations Accepted by USCIS
            </p>
          </div>
          <div className="flex flex-col items-center">
             <BadgeCheck className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 leading-snug">
              Recognized by Universities & Employers Nationwide
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
