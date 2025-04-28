import React from "react";
import Navbar from "../landing/Navbar";
import Footer from "../landing/Footer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card } from "../ui/card"; // Removed CardContent as we'll simplify
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Adjusted header padding and text sizes */}
      <div className="pt-24 pb-10 bg-gray-50"> {/* Reduced pt */}
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center"> {/* Adjusted size */}
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 text-center mt-2 max-w-3xl mx-auto"> {/* Adjusted size and mt */}
            Get in touch with our team for any questions or support
          </p>
        </div>
      </div>

      <section className="py-16"> {/* Adjusted padding */}
        <div className="container mx-auto px-4">
          {/* Changed main layout grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Contact Form */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Send Us a Message</h2> {/* Adjusted size/weight */}
              {/* Added max-w-md and adjusted space-y */}
              <form className="space-y-4 max-w-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Adjusted gap */}
                  <div className="space-y-1.5"> {/* Adjusted space-y */}
                    <label htmlFor="name" className="text-sm font-medium block"> {/* Added block */}
                      Full Name
                    </label>
                    <Input id="name" placeholder="John Smith" required />
                  </div>
                  <div className="space-y-1.5"> {/* Adjusted space-y */}
                    <label htmlFor="email" className="text-sm font-medium block"> {/* Added block */}
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5"> {/* Adjusted space-y */}
                  <label htmlFor="subject" className="text-sm font-medium block"> {/* Added block */}
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <div className="space-y-1.5"> {/* Adjusted space-y */}
                  <label htmlFor="message" className="text-sm font-medium block"> {/* Added block */}
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Your message here..."
                    rows={5}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700" /* Adjusted width */
                >
                  Send Message
                </Button>
              </form>
            </div>

            {/* Right Column: Contact Info */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Contact Information</h2> {/* Adjusted size/weight */}
              {/* Refactored contact info cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Office Card */}
                <div className="rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">Our Office</h3>
                    <p className="text-sm text-gray-600">
                      123 Translation Ave, Suite 101<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">Phone</h3>
                    <p className="text-sm text-gray-600">
                      Toll-Free: (800) 123-4567<br />
                      International: +1 212-555-7890
                    </p>
                  </div>
                </div>

                {/* Email Card */}
                <div className="rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">Email</h3>
                    <p className="text-sm text-gray-600">
                      General: info@translatenow.com<br />
                      Support: support@translatenow.com
                    </p>
                  </div>
                </div>

                {/* Business Hours Card */}
                <div className="rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-sm mb-1">Business Hours</h3>
                    <p className="text-sm text-gray-600">
                      Monday-Friday: 9am - 6pm EST<br />
                      Saturday: 10am - 2pm EST
                    </p>
                  </div>
                </div>
              </div>

              {/* Urgent Assistance Box - kept as is for now */}
              <div className="mt-8 bg-gray-100 p-6 rounded-lg">
                <h3 className="font-medium mb-2">Need Urgent Assistance?</h3>
                <p className="text-gray-600 mb-4">
                  For urgent translation needs or immediate support, please call
                  our priority line.
                </p>
                <Button variant="outline" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" /> (800) 999-8888
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
