import React, { useState } from "react";
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
import { Lock, Shield, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const contactFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
});
type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactInfoStepProps {
  onNext?: (data: any) => void;
  defaultValues?: {
    fullName?: string;
    email?: string;
  };
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
    defaultValues: {
      ...defaultValues,
    },
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

        <div>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-gray-700 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    100% Acceptance
                  </h3>
                  <p className="text-sm text-gray-700">
                    Our translations meet the requirements for certified
                    translation acceptance — it's guaranteed.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-start">
                <Lock className="h-5 w-5 text-gray-800 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Secure & Private
                  </h3>
                  <p className="text-sm text-gray-700">
                    Your documents are securely stored and only transmitted via
                    encrypted means.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-start">
                <Award className="h-5 w-5 text-gray-700 mt-0.5 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Professionally Translated
                  </h3>
                  <p className="text-sm text-gray-700">
                    Your certified translation will be completed by a
                    professional translator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoStep;
