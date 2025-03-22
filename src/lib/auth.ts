import { supabase } from "./supabase-client";

export const signUp = async (
  email: string,
  password: string,
  userData: { full_name: string },
) => {
  try {
    // Log the email to help with debugging
    console.log("Attempting to sign up with email:", email);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      // Check if it's a rate limit error and provide a more user-friendly message
      if (error.message.toLowerCase().includes("rate limit")) {
        const enhancedError = new Error(
          "Too many registration attempts. Please try again later or use a different email address.",
        );
        enhancedError.name = "RateLimitError";
        throw enhancedError;
      }
      throw error;
    }

    // Create user profile in the users table if user was created
    if (data.user) {
      try {
        // First check if user already exists in the users table
        const { data: existingUser, error: existingUserError } = await supabase
          .from("users")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle();

        if (existingUserError) {
          console.error("Error checking for existing user:", existingUserError);
        }

        // Only insert if user doesn't already exist or if there was an error checking
        if (!existingUser && !existingUserError) {
          const { error: profileError } = await supabase.from("users").upsert(
            {
              id: data.user.id,
              email: email.toLowerCase(),
              full_name: userData.full_name,
            },
            { onConflict: "id" },
          );

          if (profileError) {
            console.error("Error creating user profile:", profileError);
            // Continue with registration even if profile creation fails
          }
        } else {
          console.log("User profile already exists, skipping creation");
        }
      } catch (profileInsertError) {
        console.error("Exception creating user profile:", profileInsertError);
        // Continue with registration even if profile creation fails
      }
    }

    return data;
  } catch (error) {
    // Catch and rethrow with better error message if needed
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("rate limit")
    ) {
      const enhancedError = new Error(
        "Too many registration attempts. Please try again later or use a different email address.",
      );
      enhancedError.name = "RateLimitError";
      throw enhancedError;
    }
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
};
