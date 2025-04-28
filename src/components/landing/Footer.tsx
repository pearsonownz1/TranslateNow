import React from "react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center mb-4">
              <img src="/logos/logo2.png" alt="OpenEval Logo" className="w-40 h-auto" />
            </Link>
            {/* Updated Description */}
            <p className="mb-4 text-gray-400">
              Expert credential evaluation and certified academic translation services.
            </p>
            <div className="flex space-x-4">
              {/* Social links (placeholders) */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            {/* Updated Services section */}
            <h3 className="text-lg font-semibold text-white mb-4">Our Services</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/credential-evaluation" className="text-gray-400 hover:text-white transition-colors">
                  Credential Evaluation
                </Link>
              </li>
              <li>
                {/* Assuming you have a page or section for academic translations */}
                <Link to="/#translation-info" className="text-gray-400 hover:text-white transition-colors">
                  Certified Academic Translation
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
               <li>
                <Link to="/#faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
               <li>
                <Link to="/checkout?service=evaluation" className="text-gray-400 hover:text-white transition-colors">
                  Start Evaluation
                </Link>
              </li>
               <li>
                <Link to="/checkout?service=translation" className="text-gray-400 hover:text-white transition-colors">
                  Order Translation
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>21750 Hardy Oak Blvd Ste 104<br />PMB 649701 San Antonio,<br />Texas 78258-4946</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <span>801-335-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <a href="mailto:support@openeval.com" className="hover:text-white transition-colors">support@openeval.com</a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400">
            © {new Date().getFullYear()} OpenEval. All rights reserved.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors">Cookie Policy</Link>
            <Link to="/api-docs" className="text-sm text-gray-400 hover:text-white transition-colors">API Docs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
