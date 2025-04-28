import React from 'react';
import Navbar from '../landing/Navbar';
import Footer from '../landing/Footer';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <div className="prose max-w-none"> {/* Basic prose styling */}
          <p>
            Your privacy is important to us. It is OpenEval's policy to respect your privacy regarding any information we may collect from you across our website, [Your Website URL], and other sites we own and operate.
          </p>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
          </p>
          {/* Add more placeholder sections for Privacy Policy */}
          <h2>Information We Collect</h2>
          <p>
            Log data: Like many site operators, we collect information that your browser sends whenever you visit our Site ("Log Data"). This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser type, browser version, the pages of our Site that you visit, the time and date of your visit, the time spent on those pages and other statistics.
          </p>
          <h2>Use of Information</h2>
          <p>
            We use the information we collect in various ways, including to provide, operate, and maintain our website, improve, personalize, and expand our website, understand and analyze how you use our website, develop new products, services, features, and functionality...
          </p>
          {/* ... more sections ... */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
