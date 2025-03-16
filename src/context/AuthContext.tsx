import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase-client";
import { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Track sign-up attempts to prevent rate limiting
  const signUpAttempts = new Map<
    string,
    { count: number; lastAttempt: number }
  >();

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Check for recent sign-up attempts to prevent rate limiting
      const now = Date.now();
      const emailKey = email.toLowerCase();
      const attempts = signUpAttempts.get(emailKey) || {
        count: 0,
        lastAttempt: 0,
      };

      // If there have been multiple attempts in the last 10 minutes, add increasing delays
      if (attempts.count > 2 && now - attempts.lastAttempt < 600000) {
        const delayNeeded = Math.min(attempts.count * 2000, 10000); // Max 10 second delay
        if (now - attempts.lastAttempt < delayNeeded) {
          throw new Error(
            `Please wait a moment before trying again. Too many sign-up attempts in a short period.`,
          );
        }
      }

      // Update attempt tracking
      signUpAttempts.set(emailKey, {
        count: attempts.count + 1,
        lastAttempt: now,
      });

      // We can't directly check if a user exists in the auth system from the client SDK
      // So we'll just check our users table instead

      // Also check if user exists in our database
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      // If user already exists in our database, try to sign in instead
      if (existingUser) {
        try {
          // Try to sign in with the provided credentials
          const signInResult = await signIn(email, password);
          return signInResult;
        } catch (signInError) {
          // If sign in fails, throw a more helpful error
          throw new Error(
            "An account with this email already exists. Please sign in instead.",
          );
        }
      }

      // If no existing user, proceed with sign up with a small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 500));

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: window.location.origin + "/login",
        },
      });

      if (error) {
        // Handle rate limit error specifically
        if (error.message.includes("rate limit")) {
          // Reset attempt counter to prevent further attempts
          signUpAttempts.set(emailKey, { count: 10, lastAttempt: now });

          throw new Error(
            "Too many sign-up attempts. Please try again in a few minutes or contact support if you're having trouble creating an account.",
          );
        }
        throw error;
      }

      // Create user profile in the users table
      if (data.user) {
        // Wait a moment for the auth user to be fully created
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: email,
          full_name: name,
        });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          // Don't throw here, as the auth user is already created
        }
      }

      return data;
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If successful login, return the data
      if (!error && data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
      }

      // Handle the specific case of unconfirmed email
      if (
        error &&
        (error.message === "Email not confirmed" ||
          error.message.includes("not confirmed"))
      ) {
        console.log("Handling unconfirmed email case");

        // First check if the user exists in the auth system
        const { data: signUpData } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });

        // If we have a user from sign up attempt, they exist in auth system
        if (signUpData?.user?.id) {
          console.log("User exists in auth system, fetching from users table");

          // Try to get from the users table directly
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
            // Create a new user record if it doesn't exist in the users table
            const { data: newUserData, error: insertError } = await supabase
              .from("users")
              .insert({
                id: signUpData.user.id,
                email: email,
                full_name: signUpData.user.user_metadata?.full_name || "User",
              })
              .select()
              .single();

            if (insertError) {
              console.error("Error creating user record:", insertError);
              throw error; // Throw the original error if we can't create the user
            }

            // Use the newly created user data
            const mockUser = {
              id: signUpData.user.id,
              email: email,
              user_metadata: { full_name: newUserData.full_name },
              app_metadata: {},
              aud: "authenticated",
            };

            localStorage.setItem("user", JSON.stringify(mockUser));
            console.log("Created mock user for unconfirmed email", mockUser);
            return { user: mockUser, session: null };
          }

          if (userData) {
            // Create a mock user object
            const mockUser = {
              id: userData.id,
              email: email,
              user_metadata: { full_name: userData.full_name },
              app_metadata: {},
              aud: "authenticated",
            };

            localStorage.setItem("user", JSON.stringify(mockUser));
            console.log("Created mock user for unconfirmed email", mockUser);
            return { user: mockUser, session: null };
          }
        } else {
          // User doesn't exist in auth system, try to create them
          console.log(
            "User doesn't exist in auth system, creating new account",
          );
          const { data: newUser, error: signUpError } =
            await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: "New User",
                },
                emailRedirectTo: window.location.origin,
              },
            });

          if (signUpError) {
            console.error("Error creating new user:", signUpError);
            throw signUpError;
          }

          if (newUser?.user) {
            // Create user profile in the users table
            await supabase.from("users").insert({
              id: newUser.user.id,
              email: email,
              full_name: "New User",
            });

            // Create a mock user object
            const mockUser = {
              id: newUser.user.id,
              email: email,
              user_metadata: { full_name: "New User" },
              app_metadata: {},
              aud: "authenticated",
            };

            localStorage.setItem("user", JSON.stringify(mockUser));
            console.log("Created new user and mock session", mockUser);
            return { user: mockUser, session: null };
          }
        }
      }

      // Handle other errors
      if (error) {
        console.error("Authentication error:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
