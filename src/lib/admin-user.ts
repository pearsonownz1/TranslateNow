import { supabase } from "./supabase-client";

/**
 * Create a user with admin privileges
 * This function should only be used by administrators
 */
export const createAdminUser = async (
  email: string,
  password: string,
  userData: { full_name: string },
) => {
  try {
    // Check if we have the service role key available
    const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY;
    if (!supabaseServiceKey) {
      throw new Error("Missing SUPABASE_SERVICE_KEY environment variable");
    }

    // Create the user with admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: userData,
    });

    if (error) throw error;

    // If user was created successfully, also create an entry in the users table
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: email.toLowerCase(),
        full_name: userData.full_name,
        role: "admin", // Set role to admin
      });

      if (profileError) {
        console.error("Error creating admin user profile:", profileError);
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error("Admin user creation error:", error);
    return { data: null, error };
  }
};
