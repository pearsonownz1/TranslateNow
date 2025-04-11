import React from "react";

const SocialProof = () => {
  // Using SVG for stars for consistency
  const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
      <path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l1.83 4.426 4.849.705c.848.123 1.186 1.158.57 1.753l-3.508 3.419.829 4.831c.145.844-.74 1.485-1.494 1.099L10 16.54l-4.32 2.271c-.754.386-1.639-.255-1.494-1.099l.829-4.831-3.508-3.419c-.616-.595-.278-1.63.57-1.753l4.849-.705L9.132 2.884z" clipRule="evenodd" />
    </svg>
  );

  return (
    <section className="py-12 bg-white"> {/* Adjusted padding, removed background */}
      <div className="container mx-auto px-4">
        {/* Star reviews and client avatars */}
        <div className="flex flex-col items-center gap-3 mb-10 text-center"> {/* Adjusted gap and margin */}
          <div className="flex items-center">
             {/* Avatars - Using specific professional headshots from randomuser.me */}
             <div className="flex -space-x-2 mr-3"> {/* Overlapping avatars container */}
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-200" // Added bg color as fallback
                  src="https://randomuser.me/api/portraits/men/32.jpg" // Specific Headshot 1
                  alt="Client 1"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-200"
                  src="https://randomuser.me/api/portraits/women/44.jpg" // Specific Headshot 2
                  alt="Client 2"
                />
                <img
                  className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-200"
                  src="https://randomuser.me/api/portraits/men/76.jpg" // Specific Headshot 3
                  alt="Client 3"
                />
              </div>
            {/* Stars */}
            <div className="flex text-yellow-500"> {/* Brighter yellow */}
              <StarIcon />
              <StarIcon />
              <StarIcon />
              <StarIcon />
              <StarIcon />
            </div>
          </div>
          <p className="text-gray-700 font-medium text-base"> {/* Adjusted text size */}
            Trusted by over <strong>50K</strong> Clients
          </p>
        </div>

        {/* Logos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 text-center items-center max-w-4xl mx-auto"> {/* Adjusted gaps */}
          <div className="flex flex-col items-center"> {/* Ensure content is centered */}
            {/* Updated paths to assumed filenames based on provided images */}
            <img src="/logos/ata-logo2.png" alt="American Translators Association Logo" className="h-8 mx-auto mb-3" /> {/* Adjusted height */}
            <p className="text-sm text-gray-600 leading-snug"> {/* Added leading-snug */}
              American Translators Association Corporate Member
            </p>
          </div>
          <div className="flex flex-col items-center">
            <img src="/logos/bbb-accredited2.png" alt="Better Business Bureau Accredited Business Logo" className="h-10 mx-auto mb-3" /> {/* Adjusted height */}
            <p className="text-sm text-gray-600 leading-snug">
              Accredited with an A+ rating from the BBB
            </p>
          </div>
          <div className="flex flex-col items-center">
            <img src="/logos/trustpilot-logo.png" alt="Trustpilot Logo" className="h-8 mx-auto mb-3" /> {/* Adjusted height */}
            <p className="text-sm text-gray-600 leading-snug">
              Rated 4.8 Stars With <strong>2.7k</strong> Reviews
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
