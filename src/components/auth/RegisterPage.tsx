import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Navbar from "../landing/Navbar";
import Footer from "../landing/Footer";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useToast } from "../ui/use-toast";
import { Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState(""); // Added first name state
  const [lastName, setLastName] = useState(""); // Added last name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: "Passwords do not match",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName, // Pass first name as metadata
            last_name: lastName,   // Pass last name as metadata
            // Supabase uses 'full_name' in some contexts, consider adding it too if needed elsewhere
            // full_name: `${firstName} ${lastName}`
          },
          emailRedirectTo: `${window.location.origin}/dashboard`, // Or maybe /email-verified?
        },
      });

      if (error) throw error;

      // Insert user data into public.users table
      if (data.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          // Use the email from the input state as data.user.email might be null
          // if email confirmation is required. A trigger might handle the final email update.
          email: email,
          full_name: `${firstName} ${lastName}`,
        });

        if (insertError) {
          console.error("Error inserting user into public.users:", insertError);
          // Throw a more specific error to be caught by the outer catch block
          throw new Error(`Failed to save user profile: ${insertError.message}`);
        }
      } else {
         // Handle case where user object is unexpectedly null after successful signup
         console.error("Supabase signUp succeeded but returned no user object.");
         // Throw an error to prevent proceeding without the user record being created
         throw new Error("Registration completed but failed to save profile information.");
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account",
      });

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
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  Create your account
                </CardTitle>
                <CardDescription className="text-center">
                  Sign up to start using OpenEval
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                   {/* Added First Name and Last Name Fields */}
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label htmlFor="firstName">First Name</Label>
                       <Input
                         id="firstName"
                         placeholder="Enter your first name"
                         value={firstName}
                         onChange={(e) => setFirstName(e.target.value)}
                         required
                       />
                     </div>
                     <div className="space-y-2">
                       <Label htmlFor="lastName">Last Name</Label>
                       <Input
                         id="lastName"
                         placeholder="Enter your last name"
                         value={lastName}
                         onChange={(e) => setLastName(e.target.value)}
                         required
                       />
                     </div>
                   </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
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
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Sign in
                    </Link>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
