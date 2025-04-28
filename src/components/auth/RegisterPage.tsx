import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { Loader2, Mail, Lock, User, Building, CheckCircle } from "lucide-react"; // Added icons

const RegisterPage = () => {
  // Updated state for the new form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Combined Name field
  const [organization, setOrganization] = useState(""); // Organization field
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic password length check (optional, add more complex validation if needed)
    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Password must be at least 8 characters long.",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Attempt to sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name, // Store the full name in metadata
            organization: organization, // Store organization in metadata
          },
          // Redirect URL after email confirmation
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error; // Throw Supabase auth errors

      // Insert user data into public.users table if signup was successful and user object exists
      // Note: data.user might be null if email confirmation is pending.
      // A database trigger or edge function might be more robust for syncing profiles.
      if (data.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          email: email, // Use the email from state, as data.user.email might be null initially
          full_name: name, // Use the name from state
          // Add organization here if you have a corresponding column in the 'users' table
          // organization: organization,
        });

        if (insertError) {
          // Log the error but don't necessarily block the user flow if auth succeeded
          console.error("Error inserting user into public.users:", insertError);
          // Consider if this failure should prevent the success message
          // For now, we proceed but log the error.
          // throw new Error(`Failed to save user profile: ${insertError.message}`);
        }
      } else {
        // This case might occur if email confirmation is required.
        // The user is created in auth.users, but profile sync might need a trigger.
        console.warn("Supabase signUp successful, but user object might be pending confirmation. Profile sync might rely on triggers.");
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account.",
      });

      // Redirect to login page after showing the confirmation message
      navigate("/login");

    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Column */}
          <div className="pr-8">
            <img src="/logos/logo2.png" alt="OpenEval Logo" className="h-10 mb-6" /> {/* Updated logo path */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Expert Credential Evaluation Services
            </h2>
            <p className="text-gray-600 mb-6">
              OpenEval provides fast, reliable credential evaluations accepted by institutions across the US.
            </p>
            <h3 className="font-semibold text-gray-700 mb-3">Get started for free:</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                Fast Turnaround Times
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                Accepted by USCIS, Universities, Licensing Boards
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                Dedicated Customer Support
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                Secure Online Platform
              </li>
            </ul>
            {/* Add more descriptive text or features as needed */}
          </div>

          {/* Right Column (Form) */}
          <div>
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-center mb-6">Create Account</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Email Address */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="E.g. email@yourcompany.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10" // Add padding for icon
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <Label htmlFor="password"  className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative mt-1">
                     <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min 8 Characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10" // Add padding for icon
                    />
                  </div>
                </div>

                 {/* Name */}
                 <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="E.g John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10" // Add padding for icon
                    />
                  </div>
                </div>

                 {/* Organization */}
                 <div>
                  <Label htmlFor="organization" className="text-sm font-medium text-gray-700">Organization</Label>
                   <div className="relative mt-1">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="organization"
                      type="text"
                      placeholder="E.g Uber"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      // Not making this required unless specified
                      className="pl-10" // Add padding for icon
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" // Adjusted button color
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                 <p className="text-xs text-gray-500 text-center pt-2">
                    By signing up, you agree to our{' '}
                    <Link to="/terms" className="underline hover:text-indigo-600">terms of service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="underline hover:text-indigo-600">privacy policy</Link>.
                 </p>
              </form>
            </div>
             <p className="text-center text-sm text-gray-600 mt-6">
                Already having an account?{' '}
                <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Login
                </Link>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
