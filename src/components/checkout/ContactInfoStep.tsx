import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, Star } from "lucide-react"; // Import Star instead of Award

const contactFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactInfoStepProps {
  onNext?: (data: ContactFormValues) => void;
  defaultValues?: ContactFormValues;
}

const ContactInfoStep = ({
  onNext = () => {},
  defaultValues = {
    fullName: "",
    email: "",
  },
}: ContactInfoStepProps) => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

  const onSubmit = (data: ContactFormValues) => {
    onNext(data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Let's get started
        </h2>
        <p className="text-gray-600">
          Please enter your contact information to begin the checkout process.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          We will never share or sell your information.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button type="submit" className="w-full md:w-auto">
                      Continue to Document Upload
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Trust Indicators */}
        <div className="space-y-4">
          {/* Adjusted to space-y-4 and removed max-w-md as grid handles width */}
          <div className="p-4 rounded-md border shadow-sm flex gap-4 items-start">
            <Shield
              className="w-6 h-6 mt-1 flex-shrink-0"
              aria-hidden="true"
            />{" "}
            {/* Use Shield, updated classes */}
            <div>
              <h4 className="font-semibold text-gray-900">100% Acceptance</h4>
              <p className="text-sm text-gray-600">
                Our translations meet the requirements for certified translation
                acceptance — it's guaranteed.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-md border shadow-sm flex gap-4 items-start">
            <Lock
              className="w-6 h-6 mt-1 flex-shrink-0"
              aria-hidden="true"
            />{" "}
            {/* Use Lock, updated classes */}
            <div>
              <h4 className="font-semibold text-gray-900">Secure & Private</h4>
              <p className="text-sm text-gray-600">
                Your documents are securely stored and only transmitted via
                encrypted means.
              </p>
            </div>
          </div>
          <div className="p-4 rounded-md border shadow-sm flex gap-4 items-start">
            <Star
              className="w-6 h-6 mt-1 flex-shrink-0"
              aria-hidden="true"
            />{" "}
            {/* Use Star, updated classes */}
            <div>
              <h4 className="font-semibold text-gray-900">
                Professionally Translated
              </h4>
              <p className="text-sm text-gray-600">
                Your certified translation will be completed by a professional
                translator.
              </p>
            </div>
          </div>
          {/* Removed the "Already have an account?" section */}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoStep;
