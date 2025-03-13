import React from "react";
import Navbar from "../landing/Navbar";
import Footer from "../landing/Footer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 text-center mt-4 max-w-3xl mx-auto">
            Get in touch with our team for any questions or support
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input id="name" placeholder="John Smith" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
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

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
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
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  Send Message
                </Button>
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium mb-2">Our Office</h3>
                      <p className="text-gray-600">
                        123 Translation Ave, Suite 101
                        <br />
                        New York, NY 10001
                        <br />
                        United States
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium mb-2">Phone</h3>
                      <p className="text-gray-600">
                        Toll-Free: (800) 123-4567
                        <br />
                        International: +1 212-555-7890
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium mb-2">Email</h3>
                      <p className="text-gray-600">
                        General: info@translatenow.com
                        <br />
                        Support: support@translatenow.com
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-medium mb-2">Business Hours</h3>
                      <p className="text-gray-600">
                        Monday-Friday: 9am - 6pm EST
                        <br />
                        Saturday: 10am - 2pm EST
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

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
