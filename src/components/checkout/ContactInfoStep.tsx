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

const contactFormSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address"),
    accountType: z.enum(["guest", "login", "register"]).default("guest"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    terms: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (
        data.accountType === "register" &&
        (!data.password || data.password.length < 6)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Password must be at least 6 characters",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      if (
        data.accountType === "register" &&
        data.password !== data.confirmPassword
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    },
  )
  .refine(
    (data) => {
      if (data.accountType === "register" && !data.terms) {
        return false;
      }
      return true;
    },
    {
      message: "You must agree to the terms and conditions",
      path: ["terms"],
    },
  );

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
  const [accountType, setAccountType] = useState<
    "guest" | "login" | "register"
  >("guest");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      ...defaultValues,
      accountType: "guest",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    onNext(data);
  };

  const handleAccountTypeChange = (value: "guest" | "login" | "register") => {
    setAccountType(value);
    form.setValue("accountType", value);
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
              <Tabs
                value={accountType}
                onValueChange={handleAccountTypeChange}
                className="w-full mt-4"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="guest">Continue as Guest</TabsTrigger>
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
              </Tabs>
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

                  {(accountType === "login" || accountType === "register") && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                            />
                          </FormControl>
                          {accountType === "register" && (
                            <FormDescription>
                              Password must be at least 6 characters
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {accountType === "register" && (
                    <>
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the{" "}
                                <a
                                  href="#"
                                  className="text-blue-600 hover:underline"
                                >
                                  Terms of Service
                                </a>{" "}
                                and{" "}
                                <a
                                  href="#"
                                  className="text-blue-600 hover:underline"
                                >
                                  Privacy Policy
                                </a>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </>
                  )}

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

            <div className="pt-4">
              <p className="text-sm text-gray-500">
                Already have an account? Please{" "}
                <a href="#" className="text-gray-900 hover:underline">
                  Sign In
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoStep;
